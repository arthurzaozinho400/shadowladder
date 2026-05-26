import os
import re
import asyncio
from dotenv import load_dotenv
import discord
from discord.ext import commands
from discord import app_commands
from supabase import create_client, Client

load_dotenv()

TOKEN = os.getenv('BOT_TOKEN')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
GUILD_ID = int(os.getenv('GUILD_ID', '0'))
ROLE_ID_DESCONTO = int(os.getenv('ROLE_ID_DESCONTO', '0'))
CHANNEL_ID_PEDIDOS = int(os.getenv('CHANNEL_ID_PEDIDOS', '0'))
CATEGORY_ID_TICKETS = int(os.getenv('CATEGORY_ID_TICKETS', '0'))
CHANNEL_ID_TICKET_PANEL = int(os.getenv('CHANNEL_ID_TICKET_PANEL', '0'))

if not TOKEN or not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("BOT_TOKEN, SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórios no .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

intents = discord.Intents.default()
intents.members = True
intents.message_content = True
intents.guilds = True

bot = commands.Bot(command_prefix='!', intents=intents)

active_tickets = {}
order_counter = 0


def get_order_number():
    global order_counter
    order_counter += 1
    return order_counter


async def save_user_to_db(member: discord.Member):
    data = {
        'user_id': str(member.id),
        'discord_name': member.name,
    }
    result = supabase.table('players').upsert(data, on_conflict='user_id').execute()
    return result


async def save_order_to_db(user_id: str, discord_name: str, order_number: int, description: str, ticket_channel_id: str):
    data = {
        'user_id': user_id,
        'discord_name': discord_name,
        'order_number': order_number,
        'description': description,
        'status': 'open',
        'ticket_channel_id': ticket_channel_id,
    }
    result = supabase.table('orders').insert(data).execute()
    return result


async def update_order_status(order_number: int, claimed_by: str):
    data = {
        'status': 'claimed',
        'claimed_by': claimed_by,
        'claimed_at': 'now()',
    }
    result = supabase.table('orders').update(data).eq('order_number', order_number).execute()
    return result


async def close_ticket_logic(interaction: discord.Interaction):
    channel = interaction.channel

    if channel.id not in active_tickets:
        await interaction.response.send_message("Este canal não é um ticket ativo ou já foi fechado.", ephemeral=True)
        return

    await interaction.response.defer(ephemeral=True)

    try:
        user_id_ticket_opener = active_tickets[channel.id]['user_id']
        original_ticket_opener = interaction.guild.get_member(user_id_ticket_opener)

        del active_tickets[channel.id]

        try:
            await channel.send(f"Ticket fechado por {interaction.user.mention}. Este canal será deletado em 5 segundos.")
            if original_ticket_opener and original_ticket_opener.id != interaction.user.id:
                try:
                    await original_ticket_opener.send(
                        f"Seu ticket no servidor '{interaction.guild.name}' foi fechado por {interaction.user.display_name}. "
                        f"Se precisar de mais ajuda, abra um novo ticket."
                    )
                except discord.Forbidden:
                    print(f"Não foi possível enviar DM para {original_ticket_opener.display_name}.")
        except discord.Forbidden:
            print(f"Não foi possível enviar aviso no canal {channel.name}.")

        await asyncio.sleep(5)
        await channel.delete()
        await interaction.followup.send("Ticket fechado e canal deletado com sucesso!", ephemeral=True)

    except discord.Forbidden:
        await interaction.followup.send("Erro: Sem permissão para deletar este canal.", ephemeral=True)
    except Exception as e:
        await interaction.followup.send(f"Erro ao fechar ticket: {e}", ephemeral=True)


class CloseTicketButtonView(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @discord.ui.button(label="Fechar Ticket", style=discord.ButtonStyle.danger, custom_id="persistent_close_ticket_button")
    async def close_ticket_button_callback(self, interaction: discord.Interaction, button: discord.ui.Button):
        member_perms = interaction.channel.permissions_for(interaction.user)
        if not member_perms.manage_channels:
            await interaction.response.send_message("Você não tem permissão para fechar tickets.", ephemeral=True)
            return
        await close_ticket_logic(interaction)


class ClaimOrderView(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @discord.ui.button(label="Resgatar Pedido", style=discord.ButtonStyle.success, custom_id="persistent_claim_order_button")
    async def claim_callback(self, interaction: discord.Interaction, button: discord.ui.Button):
        member_perms = interaction.guild.get_channel(CHANNEL_ID_PEDIDOS).permissions_for(interaction.user)
        if not member_perms.manage_channels:
            await interaction.response.send_message("Você não tem permissão para resgatar pedidos.", ephemeral=True)
            return

        original_embed = interaction.message.embeds[0]
        footer_text = original_embed.footer.text
        match = re.search(r"ID do Ticket: (\d+)", footer_text)

        if not match:
            await interaction.response.send_message("Não foi possível identificar o ID do ticket.", ephemeral=True)
            return

        ticket_id = int(match.group(1))

        if ticket_id not in active_tickets:
            await interaction.response.send_message("Este ticket não está mais ativo.", ephemeral=True)
            button.disabled = True
            await interaction.message.edit(view=self)
            return

        if active_tickets[ticket_id].get('claimed_by'):
            claimed_staff_id = active_tickets[ticket_id]['claimed_by']
            claimed_staff = interaction.guild.get_member(claimed_staff_id)
            claimed_staff_name = claimed_staff.display_name if claimed_staff else "Staff Desconhecido"
            await interaction.response.send_message(f"Este pedido já foi resgatado por {claimed_staff_name}.", ephemeral=True)
            return

        active_tickets[ticket_id]['claimed_by'] = interaction.user.id

        order_num = active_tickets[ticket_id].get('order_number')
        if order_num:
            await update_order_status(order_num, str(interaction.user.id))

        updated_embed = original_embed.copy()
        updated_embed.add_field(name="Status", value=f"Resgatado por: {interaction.user.mention}", inline=False)
        updated_embed.color = discord.Color.orange()

        for item in self.children:
            if isinstance(item, discord.ui.Button):
                item.disabled = True

        await interaction.response.edit_message(embed=updated_embed, view=self)

        ticket_channel_obj = bot.get_channel(ticket_id)
        if ticket_channel_obj:
            await ticket_channel_obj.send(
                f"✅ Seu pedido (Pedido #{order_num}) foi resgatado por {interaction.user.mention}! "
                f"Ele(a) entrará em contato em breve para discutir os detalhes."
            )

        await interaction.followup.send(
            f"Você resgatou o pedido #{order_num} do ticket <#{ticket_id}>.", ephemeral=True
        )


async def create_new_ticket_logic(interaction: discord.Interaction):
    user = interaction.user
    guild = interaction.guild

    for channel_id, data in active_tickets.items():
        if data.get('user_id') == user.id:
            await interaction.response.send_message(
                f"Você já possui um ticket aberto em <#{channel_id}>. Aguarde o atendimento lá.", ephemeral=True
            )
            return

    await interaction.response.defer(ephemeral=True)

    await save_user_to_db(user)

    ticket_category = discord.utils.get(guild.categories, id=CATEGORY_ID_TICKETS)

    overwrites = {
        guild.default_role: discord.PermissionOverwrite(view_channel=False),
        user: discord.PermissionOverwrite(view_channel=True, send_messages=True, read_message_history=True, attach_files=True),
        guild.me: discord.PermissionOverwrite(view_channel=True, send_messages=True, read_message_history=True, attach_files=True, manage_channels=True),
    }

    for role in guild.roles:
        if role.permissions.move_members:
            overwrites[role] = discord.PermissionOverwrite(view_channel=True, send_messages=True, read_message_history=True, attach_files=True)

    try:
        ticket_channel = await guild.create_text_channel(
            name=f'ticket-{user.name.lower().replace(" ", "-")}-{user.discriminator}',
            category=ticket_category,
            overwrites=overwrites,
            topic=f'Ticket de {user.name}#{user.discriminator} (ID: {user.id})'
        )
    except discord.Forbidden:
        await interaction.followup.send("Erro: Sem permissão para criar canais.", ephemeral=True)
        return
    except Exception as e:
        await interaction.followup.send(f"Erro ao criar ticket: {e}", ephemeral=True)
        return

    active_tickets[ticket_channel.id] = {
        'user_id': user.id,
        'pedido': None,
        'order_message_id': None,
        'order_number': None,
        'claimed_by': None,
    }

    await interaction.followup.send(f"Seu ticket foi aberto em {ticket_channel.mention}! Prossiga lá.", ephemeral=True)

    has_discount = discord.utils.get(user.roles, id=ROLE_ID_DESCONTO) is not None
    if has_discount:
        msg = f"Olá {user.mention}, como você deseja o bot? O valor para você é **R$ 37,50**.\nPor favor, descreva o bot que você deseja."
    else:
        msg = f"Olá {user.mention}, como você deseja o bot? O valor fixo é **R$ 50,00**.\nPor favor, descreva o bot que você deseja."

    await ticket_channel.send(msg, view=CloseTicketButtonView())


class OpenTicketButtonView(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @discord.ui.button(label="Abrir um Ticket", style=discord.ButtonStyle.primary, custom_id="persistent_open_ticket_button")
    async def open_ticket_button_callback(self, interaction: discord.Interaction, button: discord.ui.Button):
        await create_new_ticket_logic(interaction)


@bot.event
async def on_ready():
    print(f'Bot conectado como {bot.user.name}')
    bot.add_view(OpenTicketButtonView())
    bot.add_view(CloseTicketButtonView())
    bot.add_view(ClaimOrderView())

    try:
        synced = await bot.tree.sync(guild=discord.Object(id=GUILD_ID))
        print(f'Sincronizados {len(synced)} comandos.')
    except Exception as e:
        print(f'Erro ao sincronizar comandos: {e}')


@bot.event
async def on_command_error(ctx: commands.Context, error: commands.CommandError):
    if isinstance(error, commands.CommandNotFound):
        return
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("Você não tem permissão para usar este comando.")
        return
    print(f'Erro no comando {ctx.command}: {error}')
    await ctx.send(f'Erro inesperado: {error}')


@bot.tree.error
async def on_app_command_error(interaction: discord.Interaction, error: app_commands.AppCommandError):
    if isinstance(error, app_commands.MissingPermissions):
        missing = ', '.join(p.replace('_', ' ').title() for p in error.missing_permissions)
        await interaction.response.send_message(f"Permissões necessárias: {missing}.", ephemeral=True)
    elif isinstance(error, app_commands.CommandOnCooldown):
        await interaction.response.send_message(f"Comando em cooldown. Tente em {error.retry_after:.2f}s.", ephemeral=True)
    else:
        print(f'Erro inesperado no comando de barra {interaction.command.name}: {error}')
        msg = f'Ocorreu um erro inesperado: {error}'
        if interaction.response.is_done():
            await interaction.followup.send(msg, ephemeral=True)
        else:
            await interaction.response.send_message(msg, ephemeral=True)


@bot.tree.command(name="ticket", description="Abre um novo ticket de atendimento.", guild=discord.Object(id=GUILD_ID))
async def open_ticket_slash_command(interaction: discord.Interaction):
    await create_new_ticket_logic(interaction)


@bot.tree.command(name="sync", description="Sincroniza seu nick do Discord com sua conta Shadow Ladder.", guild=discord.Object(id=GUILD_ID))
async def sync_discord_name(interaction: discord.Interaction):
    await interaction.response.defer(ephemeral=True)
    try:
        result = supabase.table('players').upsert(
            {'user_id': str(interaction.user.id), 'discord_name': interaction.user.name},
            on_conflict='user_id'
        ).execute()
        if result.data:
            await interaction.followup.send(
                f"✅ Sincronizado! Seu Discord name `{interaction.user.name}` foi atualizado na sua conta.", ephemeral=True
            )
        else:
            await interaction.followup.send(
                "⚠️ Você não possui uma conta Shadow Ladder vinculada ainda. Abra um ticket para se cadastrar.", ephemeral=True
            )
    except Exception as e:
        await interaction.followup.send(f"Erro ao sincronizar: {e}", ephemeral=True)


@bot.event
async def on_message(message: discord.Message):
    if message.author.bot:
        return

    if message.channel.id in active_tickets and active_tickets[message.channel.id]['pedido'] is None:
        user_id_in_ticket = active_tickets[message.channel.id]['user_id']
        if message.author.id == user_id_in_ticket:
            client_request = message.content
            active_tickets[message.channel.id]['pedido'] = client_request

            order_channel = bot.get_channel(CHANNEL_ID_PEDIDOS)
            if not order_channel:
                try:
                    order_channel = await bot.fetch_channel(CHANNEL_ID_PEDIDOS)
                except (discord.NotFound, discord.Forbidden):
                    print("Canal de pedidos não encontrado ou sem acesso.")
                    order_channel = None

            if order_channel:
                order_num = get_order_number()
                active_tickets[message.channel.id]['order_number'] = order_num

                await save_order_to_db(
                    user_id=str(message.author.id),
                    discord_name=message.author.name,
                    order_number=order_num,
                    description=client_request,
                    ticket_channel_id=str(message.channel.id),
                )

                embed = discord.Embed(
                    title=f"📝 Novo Pedido de Bot #{order_num}",
                    description=f"**Cliente:** {message.author.mention}\n"
                                f"**Ticket:** {message.channel.mention}\n\n"
                                f"**Pedido do Cliente:**\n{client_request}",
                    color=discord.Color.blue()
                )
                embed.set_footer(text=f"ID do Ticket: {message.channel.id}")

                claim_view = ClaimOrderView()
                try:
                    order_message = await order_channel.send(embed=embed, view=claim_view)
                    active_tickets[message.channel.id]['order_message_id'] = order_message.id

                    await message.channel.send(
                        "✅ **Pedido Registrado!**\n"
                        "Seu pedido foi enviado para nossa equipe. "
                        "Aguarde enquanto um membro da staff analisa sua solicitação."
                    )
                except discord.Forbidden:
                    await message.channel.send(
                        "Erro: Não tenho permissão para enviar no canal de pedidos. "
                        "Informe a equipe manualmente."
                    )
            else:
                await message.channel.send(
                    "Erro: Canal de pedidos não encontrado. Contate um administrador."
                )

    await bot.process_commands(message)


@bot.tree.command(name="fecharticket", description="Fecha o ticket atual.", guild=discord.Object(id=GUILD_ID))
@app_commands.checks.has_permissions(manage_channels=True)
async def close_ticket_slash_command(interaction: discord.Interaction):
    await close_ticket_logic(interaction)


@bot.tree.command(name="enviarpainelticket", description="Envia o painel de Tickets para o canal configurado",
                  guild=discord.Object(id=GUILD_ID))
@app_commands.checks.has_permissions(administrator=True)
async def send_ticket_panel_command(interaction: discord.Interaction):
    await interaction.response.defer(ephemeral=True)
    channel = bot.get_channel(CHANNEL_ID_TICKET_PANEL)
    if not channel:
        await interaction.followup.send("Erro: Canal do painel não encontrado.", ephemeral=True)
        return

    embed = discord.Embed(
        title="Atendimento Personalizado",
        description="Clique no botão abaixo para abrir um ticket e solicitar seu bot personalizado!\nNossa equipe está à sua espera.",
        color=discord.Color.green()
    )
    embed.set_footer(text="Responderemos o mais breve possível.")

    try:
        await channel.send(embed=embed, view=OpenTicketButtonView())
        await interaction.followup.send(f"Painel enviado para {channel.mention}!", ephemeral=True)
    except discord.Forbidden:
        await interaction.followup.send("Erro: Sem permissão para enviar neste canal.", ephemeral=True)
    except Exception as e:
        await interaction.followup.send(f"Erro ao enviar painel: {e}", ephemeral=True)


try:
    bot.run(TOKEN)
except discord.LoginFailure:
    print("ERRO: Token inválido. Gere um novo no Discord Developer Portal.")
except discord.HTTPException as e:
    print(f"ERRO DE CONEXÃO: {e}")
except Exception as e:
    print(f"ERRO INESPERADO: {e}")

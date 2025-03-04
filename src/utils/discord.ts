export default function getDiscordAvatar(userId: string, hashAvatar: string): string{
    return `https://cdn.discordapp.com/avatars/${userId}/${hashAvatar}.png`;
}

export function sanitizeInput(input: string): string {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// function ChatMessage({ message }: { message: string }) {
//     return (
//         <div dangerouslySetInnerHTML= {{ __html: sanitizeInput(message) }
// } />)
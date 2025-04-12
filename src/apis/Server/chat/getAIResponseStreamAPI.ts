import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: 'https://ai.zirun.xyz/v1',
    apiKey: 'AIzaSyAVhEv72y99jA-kMQEd_3j8Nnv3ePuQVYY',
    dangerouslyAllowBrowser: true
});

export async function* getAIResponseStreamAPI(messages: any[]) {
    const stream = await openai.chat.completions.create({
        messages: messages,
        model: "gemini-1.5-pro",
        stream: true
    });

    let fullContent = '';

    for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
            fullContent += delta;
            yield fullContent;
        }
    }
}
export default getAIResponseStreamAPI;
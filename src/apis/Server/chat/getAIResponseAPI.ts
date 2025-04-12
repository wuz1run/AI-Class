
import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: 'https://ai.zirun.xyz/v1',
    apiKey: 'AIzaSyAVhEv72y99jA-kMQEd_3j8Nnv3ePuQVYY',
    dangerouslyAllowBrowser: true
});
const getAIResponseAPI = async(messages:any)=>{

    const completion = await openai.chat.completions.create({
        messages: messages,
        model:"gemini-1.5-pro"
    });
    return completion.choices[0].message.content
}
export default getAIResponseAPI;


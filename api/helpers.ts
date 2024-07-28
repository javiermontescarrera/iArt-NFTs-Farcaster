import 'dotenv/config'

export async function handleDescriptionGeneration(userInput: string) {
  const response = await fetch(`${process.env.API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: userInput,
    }),
  });

  const data = await response.json();
                                                  
  // Cleanup the response:
  const generatedImageIdea = data.messsage.replace(/\r\n|\n|\r/gm," ").replace("   ", " ");
  // console.log(`Generated image idea (text): ${generatedImageIdea}`);
  
  // Parse it to JSON:
  const objGeneratedImageIdea =  JSON.parse(generatedImageIdea);
  // console.log(`Generated image idea: ${objGeneratedImageIdea.paintingDescription}`);

  return objGeneratedImageIdea;
};

export async function handleImageGeneration(paintingDescription: any) {
  try {
    const imageResponse = await fetch(`${process.env.API_URL}/images`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: paintingDescription,
      }),
    });

    const imageData = await imageResponse.json();
    // console.log(`imageData: ${imageData}`);
    return imageData;
    
  } catch (error) {
    console.error(error);
    return error;
  }
}
  

export async function handleUploadToIPFS(image: string) {
  const ipfsResponse = await fetch(`${process.env.API_URL}/ipfs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
      body: JSON.stringify({
      imageContent: image,
    }),
  });
  const ipfsData = await ipfsResponse.json();
  console.log(`ipfsData: ${ipfsData}`);
  return ipfsData;
}
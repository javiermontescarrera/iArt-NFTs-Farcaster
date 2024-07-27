import { Button, Frog, parseEther, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
// import { colors } from 'frog/ui'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel'
import { abi } from './assets/contracts/iArtNFT.json'
import { 
  handleDescriptionGeneration
, handleImageGeneration
, handleUploadToIPFS
 } from './helpers.ts'

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

// const firstColor= "432889";
const firstColor= "0560b2";
const secondColor= "17101F";

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  title: 'iArt-NFTs Frame',
})

app.frame('/', (c) => {
  const { buttonValue, inputText, status } = c
  const fruit = inputText || buttonValue
  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: `linear-gradient(to bottom, #${firstColor}, #${secondColor})`,
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            color: 'white',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          <p 
            style={{ 
              fontSize: 49,
              fontStyle: 'bold',
              textAlign: 'center',
              justifyContent: 'center',
            }}
          >
            Bienvenido/a a iArt NFTs!
          </p>
          <p 
            style={{ 
              fontSize: 35,
              fontStyle: 'normal',
              color: 'yellow',
            }}
          >
            Aqui podras crear tus NFTs con imagenes generadas por IA
          </p>
        </div>
      </div>
    ),
    intents: [
      // <Button.Link href="https://frutero.club">Frutero</Button.Link>,
      <Button action="/step-1">Empezar!</Button>,
    ],
  })
})

app.frame('/step-1', (c) => {
  // const { buttonValue, inputText } = c
  c.env = {paintingTitle: "Prueba", paintingDescription: "Descripcion de la prueba"}
  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: `linear-gradient(to bottom, #${firstColor}, #${secondColor})`,
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 35,
            color: 'white',
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.0,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          <p 
            style={{ 
              fontSize: 70,
              color: 'white',
              fontStyle: 'bold',
              textAlign: 'center',
              justifyContent: 'center',
            }}
          >
            Paso 1
          </p>
          <p 
            style={{
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            Escribe un estilo de arte
          </p>
          <p 
            style={{
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            Ejemplo: Impresionismo, Realismo, Popart, o el estilo que se te ocurra.
          </p>
          <p 
            style={{
              justifyContent: 'center',
              textAlign: 'center',
              fontSize: 28,
              color: 'yellow',
            }}
          >
            Luego, dale al boton Generar imagen y ten un poco de paciencia mientras la IA genera tu imagen.
          </p>
        </div>
      </div>
    ),
    intents: [
      <TextInput placeholder="Estilo de arte que deseas..." />,
      <Button action='/step-2'>Generar imagen</Button>,
      <Button.Reset>Reiniciar</Button.Reset>,
    ],
  })
})


app.frame('/step-2', async (c) => {
  const { buttonValue, inputText } = c;
  const userInput = inputText || buttonValue;

    const objGeneratedImageIdea = await handleDescriptionGeneration(userInput || "");
  
    const imageData = await handleImageGeneration(objGeneratedImageIdea.paintingDescription);
    
    const ipfsData: any = await handleUploadToIPFS(imageData);
    
    return c.res({
      image: `data:image/jpeg;base64,${imageData}`,
      intents: [
        <Button.Transaction target={`/mint/${objGeneratedImageIdea.paintingTitle}/${ipfsData.result.IpfsHash}`}>Mintear mi NFT</Button.Transaction>,
        <Button.Reset>Reiniciar</Button.Reset>,
      ],
    })
})

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

app.transaction('/mint/:paintingTitle/:ipfsHash', (c) => {
  const { inputText } = c
  const { paintingTitle, ipfsHash } = c.req.param();
  console.log(`params: ${JSON.stringify(c.req.param())}`);

  // Contract transaction response.
  return c.contract({
    abi,
    chainId: 'eip155:421614',
    functionName: 'mintToPayer',
    args: [
      paintingTitle, 
      `${inputText}`, 
      ipfsHash
    ],
    to: `0x${process.env.NFT_CONTRACT_ADDR}`,
    value: parseEther('0.0000015')
  })
})

export const GET = handle(app)
export const POST = handle(app)

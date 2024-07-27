import { Button, Frog, parseEther, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { colors } from 'frog/ui'
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

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  title: 'Frog Frame',
})

// app.frame('/', (c) => {
//   const { buttonValue, inputText, status } = c
//   const fruit = inputText || buttonValue
//   return c.res({
//     image: (
//       <div
//         style={{
//           alignItems: 'center',
//           background:
//             status === 'response'
//               ? 'linear-gradient(to right, #432889, #17101F)'
//               : 'black',
//           backgroundSize: '100% 100%',
//           display: 'flex',
//           flexDirection: 'column',
//           flexWrap: 'nowrap',
//           height: '100%',
//           justifyContent: 'center',
//           textAlign: 'center',
//           width: '100%',
//         }}
//       >
//         <div
//           style={{
//             color: 'white',
//             fontSize: 60,
//             fontStyle: 'normal',
//             letterSpacing: '-0.025em',
//             lineHeight: 1.4,
//             marginTop: 30,
//             padding: '0 120px',
//             whiteSpace: 'pre-wrap',
//           }}
//         >
//           {status === 'response'
//             ? `Nice choice.${fruit ? ` ${fruit.toUpperCase()}!!` : ''}`
//             : 'Welcome!'}
//         </div>
//       </div>
//     ),
//     intents: [
//       <TextInput placeholder="Enter custom fruit..." />,
//       <Button value="apples">Apples</Button>,
//       <Button value="oranges">Oranges</Button>,
//       <Button value="bananas">Bananas</Button>,
//       status === 'response' && <Button.Reset>Reset</Button.Reset>,
//     ],
//   })
// })

app.frame('/', (c) => {
  const { buttonValue, inputText, status } = c
  const fruit = inputText || buttonValue
  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(to bottom, #432889, #17101F)',
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
          background: 'linear-gradient(to bottom, #432889, #17101F)',
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
            color: 'yellow',
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
        </div>
      </div>
    ),
    intents: [
      <TextInput placeholder="Ingresa estilo de arte y descripcion..." />,
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
  
  return c.res({
    image: `data:image/jpeg;base64,${imageData}`,
    intents: [
      <Button.Transaction target={`/mint/${imageData}`}>Mintear mi NFT</Button.Transaction>,
      <Button.Reset>Reiniciar</Button.Reset>,
    ],
  })
})

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

app.transaction('/mint/:image', (c) => {
  const { inputText } = c
  const image = c.req.param('image')

  const ipfsData: any = handleUploadToIPFS(image);

  // Contract transaction response.
  return c.contract({
    abi,
    chainId: 'eip155:10',
    functionName: 'mintToPayer',
    args: [
      'farcaster painting', 
      `${inputText}`, 
      ipfsData.result.IpfsHash
    ],
    to: `0x${process.env.NFT_CONTRACT_ADDR}`,
    value: parseEther('0.0000015')
  })
})

export const GET = handle(app)
export const POST = handle(app)

import express from 'express';
import bodyParser from 'body-parser';
if(process.env.NODE_ENV === 'dev') {
  require('dotenv').config();
}
import {filterImageFromURL, deleteLocalFiles, isValidImageUrl} from './util/util';
import { requireAuth } from './util/auth.util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port 
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get( "/filteredImage", requireAuth, async ( req, res ) => {
    const imageUrl: string = req.query['imageUrl'];

    if(!imageUrl) {
      res.status(400).send("Query param 'imageUrl' is required");
      return;
    }
    
    if(!isValidImageUrl(imageUrl)) {
      res.status(400).send("Image url is not valid. It should end with one of the following extensions: jpeg|jpg.");

    }

    try {
      const filePath = await filterImageFromURL(imageUrl);
      await res.sendFile(filePath);

      setTimeout(() => {
        deleteLocalFiles([filePath]);
      }, 2000);

    } catch(e) {
      res.status(422).send('Something went wrong when trying to process the image. Please make sure that the provided url is a publicly accesible image.')
    }
  } );
  
app.get('/', (req, res) => {
  res.send( "image proccesing on /filteredImage" );
})
  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();
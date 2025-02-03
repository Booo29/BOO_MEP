import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { saveAs } from "file-saver";
import axios from 'axios';

export const GenerarDocumento = async (plantilla, datos, nombreSalida) =>{
    try{
        const response = await axios.get('/plantillas/' + plantilla, { responseType: 'arraybuffer' });
        const content = response.data;
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip);
          
        try {
            doc.render(datos);
            const generatedDocument = doc.getZip().generate({
                type: "blob",
                mimeType:
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              });
            saveAs(generatedDocument, nombreSalida + '.docx');
          } catch (error) {
            console.log(error);
          } finally{
              return false;
          }

        }catch(err){
            console.log(err);
        }

}

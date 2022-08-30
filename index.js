import expres from 'express';
import cors from 'cors';

const app = express();
app.use(expres().json);
app.use(cors());


app.listen(5000);

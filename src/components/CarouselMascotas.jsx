import { useEffect,useState } from "react";
import { db } from "../services/firebase";
import { collection,getDocs } from "firebase/firestore";

export default function CarouselMascotas(){

  const [dogs,setDogs] = useState([]);

  useEffect(()=>{

    const load = async ()=>{

      const snap = await getDocs(collection(db,"dogs"));

      const data = snap.docs.map(d=>({
        id:d.id,
        ...d.data()
      }));

      setDogs(data);

    };

    load();

  },[]);

  return(

    <div>

      {dogs.map(dog=>(
        <div key={dog.id}>
          <img src={dog.photo}/>
          <h3>{dog.name}</h3>
          <p>{dog.desc}</p>
        </div>
      ))}

    </div>

  );

}
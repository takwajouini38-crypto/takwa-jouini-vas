import React from "react";
import { useForm } from "@inertiajs/react";

export default function Create(){

const {data,setData,post,processing,errors} = useForm({

nom_service:"",
nom_fournisseur:"",
numero_court:"",
keyword:"",
type:"",
prix:""

});

function submit(e){
e.preventDefault();
post("/services");
}

return(

<form onSubmit={submit}>

<h2>Ajouter Service</h2>

<input
placeholder="Nom Service"
value={data.nom_service}
onChange={e=>setData("nom_service",e.target.value)}
/>
{errors.nom_service && <div>{errors.nom_service}</div>}

<input
placeholder="Fournisseur"
value={data.nom_fournisseur}
onChange={e=>setData("nom_fournisseur",e.target.value)}
/>

<input
placeholder="Numero Court"
value={data.numero_court}
onChange={e=>setData("numero_court",e.target.value)}
/>

<input
placeholder="Keyword"
value={data.keyword}
onChange={e=>setData("keyword",e.target.value)}
/>

<input
placeholder="Type"
value={data.type}
onChange={e=>setData("type",e.target.value)}
/>

<input
placeholder="Prix"
value={data.prix}
onChange={e=>setData("prix",e.target.value)}
/>

<button type="submit" disabled={processing}>
Enregistrer
</button>

</form>

)

}
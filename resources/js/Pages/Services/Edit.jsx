import React from "react";
import { router, useForm } from "@inertiajs/react";

export default function Edit({ service }) {
console.log(service);
console.log("URL :", "/services/"+service.id);
const {data,setData} = useForm({

nom_service:service.nom_service,
nom_fournisseur:service.nom_fournisseur,
numero_court:service.numero_court,
keyword:service.keyword,
type:service.type,
prix:service.prix

});
function submit(e) {
    e.preventDefault();

    router.post("/services/" + service.id, {
        ...data,
        _method: "put"
    });
}

return(

<form onSubmit={submit}>

<h2>Modifier Service</h2>

<input
value={data.nom_service}
onChange={e=>setData("nom_service",e.target.value)}
/>

<input
value={data.nom_fournisseur}
onChange={e=>setData("nom_fournisseur",e.target.value)}
/>

<input
value={data.numero_court}
onChange={e=>setData("numero_court",e.target.value)}
/>

<input
value={data.keyword}
onChange={e=>setData("keyword",e.target.value)}
/>

<input
value={data.type}
onChange={e=>setData("type",e.target.value)}
/>

<input
value={data.prix}
onChange={e=>setData("prix",e.target.value)}
/>

<button type="submit">

Modifier

</button>

</form>

);

}
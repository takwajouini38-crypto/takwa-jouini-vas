import React from "react";
import { Link, router, usePage } from "@inertiajs/react";

export default function Index() {

    const { services } = usePage().props;

   function deleteService(id) {

    if (confirm("Supprimer ce service ?")) {

        router.post("/services/" + id, {
            _method: "delete"
        });

    }

}

    return (

        <div style={{padding:"20px"}}>

            <h1>Liste des Services</h1>

            <Link href="/services/create">Ajouter Service</Link>

            <table border="1" style={{width:"100%",marginTop:"20px"}}>

                <thead>
                    <tr>
                        <th>Nom Service</th>
                        <th>Fournisseur</th>
                        <th>Numero Court</th>
                        <th>Keyword</th>
                        <th>Type</th>
                        <th>Prix</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>

                {services.map(service => (

                    <tr key={service.id}>

                        <td>{service.nom_service}</td>
                        <td>{service.nom_fournisseur}</td>
                        <td>{service.numero_court}</td>
                        <td>{service.keyword}</td>
                        <td>{service.type}</td>
                        <td>{service.prix}</td>

                        <td>

                        <Link href={"/services/"+service.id+"/edit"}>
                        Modifier
                        </Link>

                        <button onClick={()=>deleteService(service.id)}>
                        Supprimer
                        </button>

                        </td>

                    </tr>

                ))}

                </tbody>

            </table>

        </div>

    );

}
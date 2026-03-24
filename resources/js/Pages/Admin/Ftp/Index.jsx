import React, { useState } from "react";
import { useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Index({ ftps }) {

    const [editing, setEditing] = useState(null);

    const { data, setData, post, put, reset } = useForm({
        name: "",
        host: "",
        port: 21,
        username: "",
        password: "",
    });

    const submit = (e) => {
        e.preventDefault();

        if (editing) {
            put(`/admin/ftp/${editing.id}`);
        } else {
            post("/admin/ftp");
        }

        reset();
        setEditing(null);
    };

    const editFtp = (ftp) => {
        setEditing(ftp);
        setData({
            name: ftp.name,
            host: ftp.host,
            port: ftp.port,
            username: ftp.username,
            password: "",
        });
    };

    return (
        <AuthenticatedLayout title="Gestion FTP">
            <div className="p-6">
                <h1 className="text-xl font-bold mb-4">Gestion FTP</h1>

                <form onSubmit={submit} className="grid grid-cols-2 gap-2 mb-6">
                    <input placeholder="Name" value={data.name}
                        onChange={e => setData("name", e.target.value)} />

                    <input placeholder="Host" value={data.host}
                        onChange={e => setData("host", e.target.value)} />

                    <input placeholder="Port" value={data.port}
                        onChange={e => setData("port", e.target.value)} />

                    <input placeholder="Username" value={data.username}
                        onChange={e => setData("username", e.target.value)} />

                    <input type="password" placeholder="Password" value={data.password}
                        onChange={e => setData("password", e.target.value)} />

                    <button className="bg-blue-500 text-white p-2 col-span-2">
                        {editing ? "Update" : "Add"}
                    </button>
                </form>

                <table className="w-full border">
                    <thead>
                        <tr>
                            <th>Host</th>
                            <th>User</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {ftps.map(ftp => (
                            <tr key={ftp.id}>
                                <td>{ftp.host}</td>
                                <td>{ftp.username}</td>
                                <td>{ftp.is_default ? "Active" : "Inactive"}</td>
                                <td className="space-x-2">
                                    <button onClick={() => editFtp(ftp)}>Edit</button>

                                    <button
                                        onClick={() => router.post(`/admin/ftp/${ftp.id}/active`)}
                                        className="bg-green-500 text-white px-2 py-1"
                                    >
                                        Activer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
}
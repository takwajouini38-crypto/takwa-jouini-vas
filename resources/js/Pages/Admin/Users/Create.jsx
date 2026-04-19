import React, { useEffect, useState } from "react";
import { Link, useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { 
  ArrowLeftIcon, 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  PlusCircleIcon
} from "@heroicons/react/24/outline";
import axios from "axios";

// Modal de confirmation
const ConfirmCreateModal = ({ isOpen, onClose, onConfirm, userData, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-scale-in">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <PlusCircleIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Confirmer la création
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Vérifiez les informations
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <p className="text-gray-700 font-medium mb-3">
              Nouvel utilisateur :
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <UserIcon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 font-medium">Nom :</span>
                <span className="text-gray-900 font-semibold">{userData?.name || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 font-medium">Email :</span>
                <span className="text-gray-900 font-semibold">{userData?.email || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheckIcon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 font-medium">Rôle :</span>
                <span className="text-gray-900 font-semibold">
                  {userData?.role === 'admin' && '👑 Administrateur'}
                  {userData?.role === 'technicien' && '🔧 Technicien'}
                  {userData?.role === 'analyst_op' && '📊 Analyste OP'}
                  {userData?.role === 'analyst_biz' && '📈 Analyste Business'}
                  {!userData?.role && '-'}
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-amber-600 mb-4 flex items-center gap-1">
            <ExclamationCircleIcon className="h-4 w-4" />
            Assurez-vous que les informations sont correctes avant de valider.
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 inline mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Création...
                </>
              ) : (
                "Confirmer la création"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Create() {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        name: "",
        email: "",
        password: "",
        role: "",
    });

    const [touched, setTouched] = useState({
        name: false,
        email: false,
        password: false,
        role: false
    });
    
    const [emailStatus, setEmailStatus] = useState(null);
    const [passwordStatus, setPasswordStatus] = useState([]);
    const [localErrors, setLocalErrors] = useState({
        name: "",
        email: "",
        role: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ---------------- VALIDATION NOM ----------------
    useEffect(() => {
        if (touched.name) {
            if (!data.name) {
                setLocalErrors(prev => ({ ...prev, name: "Le nom est requis." }));
            } else if (data.name.length < 2) {
                setLocalErrors(prev => ({ ...prev, name: "Le nom doit contenir au moins 2 caractères." }));
            } else {
                setLocalErrors(prev => ({ ...prev, name: "" }));
                if (errors.name) clearErrors('name');
            }
        }
    }, [data.name, touched.name]);

    // ---------------- EMAIL LIVE CHECK ----------------
    useEffect(() => {
        if (!data.email) {
            setEmailStatus(null);
            if (touched.email) {
                setLocalErrors(prev => ({ ...prev, email: "L'email est requis." }));
            }
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(data.email)) {
            setLocalErrors(prev => ({ ...prev, email: "Format d'email invalide." }));
            setEmailStatus(null);
            return;
        }

        setLocalErrors(prev => ({ ...prev, email: "" }));

        const delay = setTimeout(() => {
            axios.get("/admin/users/check-email", {
                params: { email: data.email }
            })
            .then(res => {
                setEmailStatus(res.data.exists ? "taken" : "available");
                if (res.data.exists) {
                    setLocalErrors(prev => ({ ...prev, email: "Cet email est déjà utilisé." }));
                } else {
                    setLocalErrors(prev => ({ ...prev, email: "" }));
                }
            })
            .catch(() => setEmailStatus(null));
        }, 500);

        return () => clearTimeout(delay);
    }, [data.email, touched.email]);

    // ---------------- PASSWORD VALIDATION ----------------
    useEffect(() => {
        const pwd = data.password;
        const list = [];

        if (!pwd) {
            setPasswordStatus([]);
            return;
        }

        if (pwd.length < 6) list.push("❌ Minimum 6 caractères");
        if (!/[A-Z]/.test(pwd)) list.push("❌ Une majuscule requise");
        if (!/[0-9]/.test(pwd)) list.push("❌ Un chiffre requis");
        if (!/[!@#$%^&*]/.test(pwd)) list.push("❌ Un caractère spécial requis");

        if (list.length === 0) list.push("✅ Mot de passe valide");

        setPasswordStatus(list);
    }, [data.password]);

    // ---------------- VALIDATION RÔLE ----------------
    useEffect(() => {
        if (touched.role && !data.role) {
            setLocalErrors(prev => ({ ...prev, role: "Le rôle est requis." }));
        } else if (touched.role) {
            setLocalErrors(prev => ({ ...prev, role: "" }));
            if (errors.role) clearErrors('role');
        }
    }, [data.role, touched.role]);

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Marquer tous les champs comme touchés
        setTouched({
            name: true,
            email: true,
            password: true,
            role: true
        });
        
        // Vérifier si le formulaire est valide
        if (!data.name || !data.email || !data.password || !data.role) {
            return;
        }
        
        if (emailStatus === "taken") {
            return;
        }
        
        // Ouvrir le modal de confirmation
        setShowConfirmModal(true);
    };

    const confirmCreate = () => {
        setIsSubmitting(true);
        
        post("/admin/users", {
            onSuccess: () => {
                setShowConfirmModal(false);
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
                setShowConfirmModal(false);
            }
        });
    };

    const isPasswordValid = passwordStatus.length === 1 && passwordStatus[0].startsWith("✅");

    const getFieldStatus = (field) => {
        if (!touched[field]) return null;
        
        if (field === 'name') {
            if (!data.name) return 'error';
            if (data.name.length < 2) return 'error';
            return 'success';
        }
        
        if (field === 'email') {
            if (!data.email) return 'error';
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(data.email)) return 'error';
            if (emailStatus === "taken") return 'error';
            if (emailStatus === "available") return 'success';
            return null;
        }
        
        if (field === 'password') {
            if (!data.password) return 'error';
            if (!isPasswordValid) return 'error';
            return 'success';
        }
        
        if (field === 'role') {
            if (!data.role) return 'error';
            return 'success';
        }
        
        return null;
    };

    const getFieldStyles = (field) => {
        const status = getFieldStatus(field);
        if (status === 'success') {
            return 'border-green-400 focus:ring-green-500 focus:border-green-500 pr-10';
        }
        if (status === 'error') {
            return 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50 pr-10';
        }
        return 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    };

    // Calcul de la force du mot de passe
    const getPasswordStrength = () => {
        const pwd = data.password;
        if (!pwd) return { score: 0, label: "", color: "" };
        
        let score = 0;
        if (pwd.length >= 6) score++;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[!@#$%^&*]/.test(pwd)) score++;
        
        if (score <= 2) return { score: (score / 5) * 100, label: "Faible", color: "bg-red-500" };
        if (score <= 3) return { score: (score / 5) * 100, label: "Moyen", color: "bg-orange-500" };
        if (score <= 4) return { score: (score / 5) * 100, label: "Fort", color: "bg-yellow-500" };
        return { score: 100, label: "Très fort", color: "bg-green-500" };
    };

    const passwordStrength = getPasswordStrength();

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Créer un utilisateur
                </h2>
            }
        >
            <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* CARD */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <PlusCircleIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    Ajouter un utilisateur
                                </h2>
                                <p className="text-blue-100 text-sm mt-0.5">
                                    Créez un nouveau compte utilisateur
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* NAME */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nom complet <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserIcon className={`h-5 w-5 transition-colors duration-200 ${
                                            getFieldStatus('name') === 'success' ? 'text-green-500' : 
                                            getFieldStatus('name') === 'error' ? 'text-red-500' : 'text-gray-400'
                                        }`} />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        onBlur={() => handleBlur('name')}
                                        className={`block w-full pl-10 pr-10 py-2.5 rounded-lg border shadow-sm focus:ring-2 transition-all duration-200 ${getFieldStyles('name')}`}
                                        placeholder="Jean Dupont"
                                    />
                                    {getFieldStatus('name') === 'success' && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                        </div>
                                    )}
                                    {getFieldStatus('name') === 'error' && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                                        </div>
                                    )}
                                </div>
                                {(localErrors.name && touched.name) && (
                                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                        <ExclamationCircleIcon className="h-3 w-3" />
                                        {localErrors.name}
                                    </p>
                                )}
                                {errors.name && !localErrors.name && (
                                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* EMAIL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <EnvelopeIcon className={`h-5 w-5 transition-colors duration-200 ${
                                            getFieldStatus('email') === 'success' ? 'text-green-500' : 
                                            getFieldStatus('email') === 'error' ? 'text-red-500' : 'text-gray-400'
                                        }`} />
                                    </div>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        onBlur={() => handleBlur('email')}
                                        className={`block w-full pl-10 pr-10 py-2.5 rounded-lg border shadow-sm focus:ring-2 transition-all duration-200 ${getFieldStyles('email')}`}
                                        placeholder="jean@exemple.com"
                                    />
                                    {getFieldStatus('email') === 'success' && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                        </div>
                                    )}
                                    {getFieldStatus('email') === 'error' && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                                        </div>
                                    )}
                                </div>
                                {(localErrors.email && touched.email) && (
                                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                        <ExclamationCircleIcon className="h-3 w-3" />
                                        {localErrors.email}
                                    </p>
                                )}
                                {emailStatus === "available" && !localErrors.email && (
                                    <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                                        <CheckCircleIcon className="h-3 w-3" />
                                        Email disponible
                                    </p>
                                )}
                                {errors.email && !localErrors.email && (
                                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mot de passe <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockClosedIcon className={`h-5 w-5 transition-colors duration-200 ${
                                            getFieldStatus('password') === 'success' ? 'text-green-500' : 
                                            getFieldStatus('password') === 'error' ? 'text-red-500' : 'text-gray-400'
                                        }`} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={data.password}
                                        onChange={(e) => setData("password", e.target.value)}
                                        onBlur={() => handleBlur('password')}
                                        className={`block w-full pl-10 pr-12 py-2.5 rounded-lg border shadow-sm focus:ring-2 transition-all duration-200 ${getFieldStyles('password')}`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                    {getFieldStatus('password') === 'success' && (
                                        <div className="absolute inset-y-0 right-0 pr-10 flex items-center">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                        </div>
                                    )}
                                </div>

                                {/* Barre de force du mot de passe */}
                                {data.password && (
                                    <div className="mt-2">
                                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${passwordStrength.color} transition-all duration-300 rounded-full`}
                                                style={{ width: `${passwordStrength.score}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Force : {passwordStrength.label}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-2 space-y-1">
                                    {passwordStatus.map((msg, i) => (
                                        <p
                                            key={i}
                                            className={`text-xs ${
                                                msg.startsWith("✅") ? "text-green-600" : "text-red-600"
                                            } flex items-center gap-1`}
                                        >
                                            {msg.startsWith("✅") ? <CheckCircleIcon className="h-3 w-3" /> : <ExclamationCircleIcon className="h-3 w-3" />}
                                            {msg.substring(2)}
                                        </p>
                                    ))}
                                </div>

                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {/* ROLE */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rôle <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <ShieldCheckIcon className={`h-5 w-5 transition-colors duration-200 ${
                                            getFieldStatus('role') === 'success' ? 'text-green-500' : 
                                            getFieldStatus('role') === 'error' ? 'text-red-500' : 'text-gray-400'
                                        }`} />
                                    </div>
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData("role", e.target.value)}
                                        onBlur={() => handleBlur('role')}
                                        className={`block w-full pl-10 pr-10 py-2.5 rounded-lg border shadow-sm focus:ring-2 transition-all duration-200 ${getFieldStyles('role')} appearance-none`}
                                    >
                                        <option value="">Choisir un rôle</option>
                                        <option value="admin">👑 Administrateur</option>
                                        <option value="analyst_op">📊 Analyste OP</option>
                                        <option value="analyst_biz">📈 Analyste Business</option>
                                    </select>
                                    {getFieldStatus('role') === 'success' && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                        </div>
                                    )}
                                    {getFieldStatus('role') === 'error' && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                                        </div>
                                    )}
                                </div>
                                {(localErrors.role && touched.role) && (
                                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                        <ExclamationCircleIcon className="h-3 w-3" />
                                        {localErrors.role}
                                    </p>
                                )}
                                {errors.role && !localErrors.role && (
                                    <p className="mt-1 text-xs text-red-600">{errors.role}</p>
                                )}
                            </div>

                            {/* BUTTONS GROUP */}
                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                                {/* Bouton Retour */}
                                <Link
                                    href="/admin/users"
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 border border-blue-600 rounded-lg font-semibold text-sm text-white hover:bg-blue-700 hover:border-blue-700 transition-all duration-200 shadow-sm"
                                >
                                    <ArrowLeftIcon className="h-4 w-4" />
                                    Retour à la liste
                                </Link>

                                {/* Bouton Créer */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center px-6 py-2.5 bg-green-600 border border-transparent rounded-lg font-semibold text-sm text-white uppercase tracking-widest hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    <PlusCircleIcon className="h-4 w-4 mr-2" />
                                    {processing ? "Enregistrement..." : "Créer l'utilisateur"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal de confirmation */}
            <ConfirmCreateModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmCreate}
                userData={data}
                isLoading={isSubmitting}
            />
        </AuthenticatedLayout>
    );
}
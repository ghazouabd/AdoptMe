import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import AdoptMeArtifact from './contracts/AdoptMe.json';
// ABI manuel pour le contrat AdoptMe
const ADOPT_ME_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "petId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "adopter",
        "type": "address"
      }
    ],
    "name": "PetAdopted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "petId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "PetAdded",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_age",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_breed",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_imageURL",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_adoptionFee",
        "type": "uint256"
      }
    ],
    "name": "addPet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_petId",
        "type": "uint256"
      }
    ],
    "name": "adoptPet",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllPets",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "age",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "breed",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "address payable",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "isAdopted",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "adoptionFee",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "imageURL",
            "type": "string"
          }
        ],
        "internalType": "struct AdoptMe.Pet[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "petCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

function App() {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPet, setCurrentPet] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showAddPetModal, setShowAddPetModal] = useState(false);
    const [contractAddress, setContractAddress] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminAddress, setAdminAddress] = useState('');

    // États pour ajouter un animal
    const [newPet, setNewPet] = useState({
        name: '',
        age: '',
        breed: '',
        description: '',
        imageURL: '',
        adoptionFee: '0'
    });

    // Charger l'adresse du contrat depuis le localStorage ou utiliser une valeur par défaut
    useEffect(() => {
        const savedAddress = localStorage.getItem('adoptMeContractAddress');
        if (savedAddress) {
            setContractAddress(savedAddress);
        }
    }, []);

async function findDeployedContractAddress() {
  try {
    const networkId = await window.ethereum.request({ method: 'net_version' });
    const addr = AdoptMeArtifact.networks?.[networkId]?.address;
    if (addr) {
      console.log('✅ Contract found in src/contracts:', addr);
      return addr;
    }
  } catch (e) {
    console.log('Cannot load artifact:', e);
  }
  return null;
}
    // Connexion au wallet
    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                setAccount(accounts[0]);
                
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                
                // Trouver automatiquement l'adresse du contrat
                let addressToUse = contractAddress;
                if (!addressToUse) {
                    console.log('🔍 Recherche automatique du contrat...');
                    addressToUse = await findDeployedContractAddress();
                }
                
                if (!addressToUse) {
                    alert('❌ Contrat non trouvé. Déployez le contrat d\'abord avec "truffle migrate"');
                    return;
                }
                
                setContractAddress(addressToUse);
                localStorage.setItem('adoptMeContractAddress', addressToUse);
                
                const adoptMeContract = new ethers.Contract(addressToUse, ADOPT_ME_ABI, signer);
                setContract(adoptMeContract);
                
                // Vérifier si l'utilisateur est l'admin
                try {
                    const admin = await adoptMeContract.admin();
                    setAdminAddress(admin);
                    setIsAdmin(accounts[0].toLowerCase() === admin.toLowerCase());
                    console.log('👑 Admin address:', admin);
                } catch (e) {
                    console.log('Error fetching admin:', e);
                    setIsAdmin(false);
                }
                
                await loadPets(adoptMeContract);
                
            } catch (error) {
                console.error("Error connecting wallet:", error);
                alert('❌ Erreur: ' + error.message);
            }
        } else {
            alert('⚠️ Veuillez installer MetaMask!');
        }
    };

    // Charger les animaux
    const loadPets = async (contractInstance = contract) => {
        if (!contractInstance) return;
        
        setLoading(true);
        try {
            const petsData = await contractInstance.getAllPets();
            const formattedPets = petsData.map(pet => ({
                id: pet.id.toNumber(),
                name: pet.name,
                age: pet.age.toNumber(),
                breed: pet.breed,
                description: pet.description,
                owner: pet.owner,
                isAdopted: pet.isAdopted,
                adoptionFee: ethers.utils.formatEther(pet.adoptionFee),
                imageURL: pet.imageURL
            }));
            setPets(formattedPets);
            console.log('🐾 Animaux chargés:', formattedPets.length);
        } catch (error) {
            console.error("Error loading pets:", error);
            alert("❌ Erreur de chargement: " + error.message);
        }
        setLoading(false);
    };

    // Adopter un animal
    const adoptPet = async (petId, adoptionFee) => {
        if (!contract) return;
        
        try {
            setLoading(true);
            const tx = await contract.adoptPet(petId, {
                value: ethers.utils.parseEther(adoptionFee)
            });
            await tx.wait();
            await loadPets();
            setShowModal(false);
            alert('🎉 Félicitations! Vous avez adopté cet animal!');
        } catch (error) {
            console.error("Error adopting pet:", error);
            alert("❌ Erreur lors de l'adoption: " + error.message);
        }
        setLoading(false);
    };

    // Ajouter un animal (admin seulement)
    const addPet = async () => {
        if (!contract || !isAdmin) return;
        
        try {
            setLoading(true);
            const tx = await contract.addPet(
                newPet.name,
                parseInt(newPet.age),
                newPet.breed,
                newPet.description,
                newPet.imageURL,
                ethers.utils.parseEther(newPet.adoptionFee || '0')
            );
            await tx.wait();
            await loadPets();
            setShowAddPetModal(false);
            setNewPet({ name: '', age: '', breed: '', description: '', imageURL: '', adoptionFee: '0' });
            alert('✅ Animal ajouté avec succès!');
        } catch (error) {
            console.error("Error adding pet:", error);
            alert("❌ Erreur lors de l'ajout: " + error.message);
        }
        setLoading(false);
    };

    // Ouvrir modals
    const openAdoptModal = (pet) => {
        setCurrentPet(pet);
        setShowModal(true);
    };

    const openAddPetModal = () => {
        setShowAddPetModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPet(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Animaux par défaut à ajouter
    const defaultPets = [
        {
            name: "Bella",
            age: 2,
            breed: "Labrador",
            description: "Joueur et affectueux",
            imageURL: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300",
            adoptionFee: "0"
        },
        {
            name: "Max",
            age: 3,
            breed: "Golden Retriever", 
            description: "Calme et fidèle",
            imageURL: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300",
            adoptionFee: "0.01"
        },
        {
            name: "Luna",
            age: 1,
            breed: "Chat Siamois",
            description: "Élégante et indépendante",
            imageURL: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=300",
            adoptionFee: "0"
        }
    ];

    
    // Réinitialiser l'adresse du contrat
    const resetContractAddress = () => {
        localStorage.removeItem('adoptMeContractAddress');
        setContractAddress('');
        setContract(null);
        setPets([]);
        alert('🔄 Adresse du contrat réinitialisée. Reconnectez-vous.');
    };

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                setAccount(accounts[0] || '');
                // Recharger les données quand le compte change
                if (accounts[0] && contract) {
                    loadPets();
                }
            });

            window.ethereum.on('chainChanged', (chainId) => {
                window.location.reload();
            });
        }
    }, [contract]);

    return (
        <div className="App">
            <header className="app-header">
                <div className="container">
                    <h1>🐾 AdoptMe</h1>
                    <div className="wallet-info">
                        {account ? (
                            <div>
                                <span className="account-address">
                                    {isAdmin ? '👑 ' : '👛 '}
                                    {account.slice(0, 6)}...{account.slice(-4)}
                                    {isAdmin && ' (Admin)'}
                                </span>
                                {contractAddress && (
                                    <div className="contract-info">
                                        <span>Contrat: {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}</span>
                                        <button className="reset-btn" onClick={resetContractAddress} title="Réinitialiser l'adresse">
                                            🔄
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button className="connect-btn" onClick={connectWallet}>
                                Connecter Wallet
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <section className="hero">
                <div className="container">
                    <h2>Donnez un foyer à un animal dans le besoin</h2>
                    <p>Des animaux adorables attendent leur famille pour toujours</p>
                </div>
            </section>

            <main className="container">
                <div className="section-header">
                    <h2>Nos Animaux à Adopter</h2>
                    <div className="actions">
                        {account && contract && (
                            <>
                                <button className="refresh-btn" onClick={() => loadPets()} disabled={loading}>
                                    {loading ? '🔄...' : '🔄 Actualiser'}
                                </button>
                                {isAdmin && (
                                    <>
                                        <button className="add-pet-btn" onClick={openAddPetModal} disabled={loading}>
                                            ➕ Ajouter
                                        </button>
                                        
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {!account ? (
                    <div className="connect-prompt">
                        <p>🔒 Connectez votre wallet pour voir les animaux</p>
                        <button className="connect-btn" onClick={connectWallet}>
                            Connecter Wallet
                        </button>
                    </div>
                ) : loading ? (
                    <div className="loading">🔄 Chargement des animaux...</div>
                ) : pets.length === 0 ? (
                    <div className="no-pets">
                        <p>🐾 Aucun animal disponible pour l'adoption</p>
                        {isAdmin && (
                            <p>Utilisez le bouton "➕ Ajouter" ou "🐾 Animaux Défaut" pour ajouter des animaux</p>
                        )}
                    </div>
                ) : (
                    <div className="pets-grid">
                        {pets.map(pet => (
                            <div key={pet.id} className="pet-card">
                                <img src={pet.imageURL} alt={pet.name} className="pet-image" 
                                     onError={(e) => {
                                         e.target.src = 'https://via.placeholder.com/300x200/667eea/ffffff?text=Image+Non+Disponible';
                                     }} />
                                <div className="pet-info">
                                    <h3>{pet.name}</h3>
                                    <p className="pet-breed">{pet.breed}</p>
                                    <p className="pet-age">{pet.age} an(s)</p>
                                    <p className="pet-description">{pet.description}</p>
                                    <p className="pet-fee">💰 {pet.adoptionFee} ETH</p>
                                    <div className="pet-status">
                                        {pet.isAdopted ? (
                                            <span className="adopted">✅ Adopté</span>
                                        ) : (
                                            <button 
                                                className="adopt-btn"
                                                onClick={() => openAdoptModal(pet)}
                                                disabled={!account || isAdmin}
                                            >
                                                {isAdmin ? '👑 Admin' : '🏠 Adopter'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal d'adoption */}
            {showModal && currentPet && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Confirmer l'adoption</h3>
                        <p>Êtes-vous sûr de vouloir adopter <strong>{currentPet.name}</strong> ?</p>
                        <div className="pet-details">
                            <p><strong>Race:</strong> {currentPet.breed}</p>
                            <p><strong>Âge:</strong> {currentPet.age} an(s)</p>
                            <p><strong>Description:</strong> {currentPet.description}</p>
                            <p><strong>Frais d'adoption:</strong> {currentPet.adoptionFee} ETH</p>
                        </div>
                        <div className="modal-actions">
                            <button 
                                className="confirm-btn"
                                onClick={() => adoptPet(currentPet.id, currentPet.adoptionFee)}
                                disabled={loading}
                            >
                                {loading ? '⏳ Transaction...' : '✅ Confirmer l\'adoption'}
                            </button>
                            <button 
                                className="cancel-btn"
                                onClick={() => setShowModal(false)}
                                disabled={loading}
                            >
                                ❌ Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal d'ajout d'animal */}
            {showAddPetModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Ajouter un animal</h3>
                        <div className="form-group">
                            <input type="text" name="name" placeholder="Nom" value={newPet.name} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <input type="number" name="age" placeholder="Âge" value={newPet.age} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <input type="text" name="breed" placeholder="Race" value={newPet.breed} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <textarea name="description" placeholder="Description" value={newPet.description} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <input type="text" name="imageURL" placeholder="URL Image" value={newPet.imageURL} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <input type="text" name="adoptionFee" placeholder="Frais d'adoption (ETH)" value={newPet.adoptionFee} onChange={handleInputChange} />
                        </div>
                        <div className="modal-actions">
                            <button 
                                className="confirm-btn"
                                onClick={addPet}
                                disabled={loading || !newPet.name}
                            >
                                {loading ? '⏳...' : '✅ Ajouter l\'animal'}
                            </button>
                            <button 
                                className="cancel-btn"
                                onClick={() => setShowAddPetModal(false)}
                            >
                                ❌ Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <footer>
                <div className="container">
                    <p>&copy; 2024 AdoptMe. Tous droits réservés.</p>
                </div>
            </footer>
        </div>
    );
}

export default App;
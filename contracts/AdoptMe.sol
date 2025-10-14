// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AdoptMe {
    struct Pet {
        uint id;
        string name;
        uint age;
        string breed;
        string description;
        address payable owner;
        bool isAdopted;
        uint adoptionFee;
        string imageURL;
    }
    
    mapping(uint => Pet) public pets;
    mapping(address => uint[]) public userAdoptions;
    
    uint public petCount;
    address public admin;
    
    event PetAdded(uint petId, string name, address owner);
    event PetAdopted(uint petId, address adopter);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier petExists(uint _petId) {
        require(_petId > 0 && _petId <= petCount, "Pet does not exist");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        petCount = 0;
        
        // Ajouter quelques animaux par défaut (sans caractères accentués)
        addPet("Bella", 2, "Labrador", "Gentille et joueuse", "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300", 0);
        addPet("Max", 3, "Golden Retriever", "Tres affectueux", "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300", 0);
        addPet("Luna", 1, "Chat Siamois", "Calme et elegante", "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=300", 0);
        addPet("Charlie", 4, "Berger Australien", "Energique et intelligent", "https://images.unsplash.com/photo-1560743641-3914f2c45636?w=300", 0);
        addPet("Milo", 2, "Chat Persan", "Doux et paisible", "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=300", 0);
    }
    
    function addPet(
        string memory _name,
        uint _age,
        string memory _breed,
        string memory _description,
        string memory _imageURL,
        uint _adoptionFee
    ) public onlyAdmin {
        petCount++;
        pets[petCount] = Pet({
            id: petCount,
            name: _name,
            age: _age,
            breed: _breed,
            description: _description,
            owner: payable(admin),
            isAdopted: false,
            adoptionFee: _adoptionFee,
            imageURL: _imageURL
        });
        
        emit PetAdded(petCount, _name, admin);
    }
    
    function adoptPet(uint _petId) public payable petExists(_petId) {
        Pet storage pet = pets[_petId];
        
        require(!pet.isAdopted, "Pet already adopted");
        require(msg.value >= pet.adoptionFee, "Insufficient adoption fee");
        
        // Transférer les frais à l'ancien propriétaire
        if (pet.adoptionFee > 0) {
            pet.owner.transfer(pet.adoptionFee);
        }
        
        // Rembourser l'excédent
        if (msg.value > pet.adoptionFee) {
            payable(msg.sender).transfer(msg.value - pet.adoptionFee);
        }
        
        pet.owner = payable(msg.sender);
        pet.isAdopted = true;
        userAdoptions[msg.sender].push(_petId);
        
        emit PetAdopted(_petId, msg.sender);
    }
    
    function getPet(uint _petId) public view petExists(_petId) returns (
        uint id,
        string memory name,
        uint age,
        string memory breed,
        string memory description,
        address owner,
        bool isAdopted,
        uint adoptionFee,
        string memory imageURL
    ) {
        Pet memory pet = pets[_petId];
        return (
            pet.id,
            pet.name,
            pet.age,
            pet.breed,
            pet.description,
            pet.owner,
            pet.isAdopted,
            pet.adoptionFee,
            pet.imageURL
        );
    }
    
    function getAllPets() public view returns (Pet[] memory) {
        Pet[] memory allPets = new Pet[](petCount);
        
        for (uint i = 1; i <= petCount; i++) {
            allPets[i-1] = pets[i];
        }
        
        return allPets;
    }
    
    function getAvailablePets() public view returns (Pet[] memory) {
        uint availableCount = 0;
        
        // Compter les animaux disponibles
        for (uint i = 1; i <= petCount; i++) {
            if (!pets[i].isAdopted) {
                availableCount++;
            }
        }
        
        // Créer le tableau des animaux disponibles
        Pet[] memory availablePets = new Pet[](availableCount);
        uint currentIndex = 0;
        
        for (uint i = 1; i <= petCount; i++) {
            if (!pets[i].isAdopted) {
                availablePets[currentIndex] = pets[i];
                currentIndex++;
            }
        }
        
        return availablePets;
    }
    
    function getUserAdoptions(address _user) public view returns (uint[] memory) {
        return userAdoptions[_user];
    }
    
    function getPetCount() public view returns (uint) {
        return petCount;
    }
}
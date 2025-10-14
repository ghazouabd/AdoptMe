const AdoptMe = artifacts.require("AdoptMe");

contract("AdoptMe", (accounts) => {
    let adoptMe;
    const admin = accounts[0];
    const user = accounts[1];

    beforeEach(async () => {
        adoptMe = await AdoptMe.new({ from: admin });
    });

    it("should deploy with initial pets", async () => {
        const petCount = await adoptMe.petCount();
        assert.equal(petCount.toNumber(), 3, "Should have 3 initial pets");
    });

    it("should allow adopting a pet", async () => {
        const petId = 1;
        
        // Vérifier que le pet n'est pas adopté
        const petBefore = await adoptMe.getPet(petId);
        assert.equal(petBefore.isAdopted, false, "Pet should not be adopted initially");

        // Adopter le pet
        await adoptMe.adoptPet(petId, { from: user, value: 0 });

        // Vérifier que le pet est adopté
        const petAfter = await adoptMe.getPet(petId);
        assert.equal(petAfter.isAdopted, true, "Pet should be adopted");
        assert.equal(petAfter.owner, user, "Pet owner should be the adopter");
    });

    it("should get available pets", async () => {
        const availablePets = await adoptMe.getAvailablePets();
        assert.equal(availablePets.length, 3, "Should have 3 available pets initially");
    });
});
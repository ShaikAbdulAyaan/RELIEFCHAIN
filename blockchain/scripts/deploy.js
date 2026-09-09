import hre from "hardhat";

async function main() {

    const { ethers } =
        await hre.network.connect();


    // ========================================================
    // GET LOCAL DEVELOPMENT ACCOUNTS
    // ========================================================

    const signers =
        await ethers.getSigners();

    const admin =
        signers[0];

    const system =
        signers[1];

    const auditor =
        signers[2];


    console.log("\n=================================");
    console.log("RELIEFCHAIN LOCAL DEPLOYMENT");
    console.log("=================================\n");

    console.log("Admin wallet:   ", admin.address);
    console.log("System wallet:  ", system.address);
    console.log("Auditor wallet: ", auditor.address);


    // ========================================================
    // DEPLOY CONTRACT
    // ========================================================

    console.log("\nDeploying ReliefChain...");

    const ReliefChain =
        await ethers.getContractFactory(
            "ReliefChain"
        );

    const reliefChain =
        await ReliefChain.deploy(
            admin.address
        );

    await reliefChain.waitForDeployment();


    const contractAddress =
        await reliefChain.getAddress();


    console.log("\n=================================");
    console.log("ReliefChain deployed successfully!");
    console.log("=================================");

    console.log(
        "Contract address:",
        contractAddress
    );


    // ========================================================
    // ROLES
    // ========================================================

    const SYSTEM_ROLE =
        await reliefChain.SYSTEM_ROLE();

    const AUDITOR_ROLE =
        await reliefChain.AUDITOR_ROLE();

    const NGO_ROLE =
        await reliefChain.NGO_ROLE();


    // ========================================================
    // GRANT SYSTEM ROLE
    // ========================================================

    console.log(
        "\nGranting SYSTEM_ROLE..."
    );

    const systemTx =
        await reliefChain.grantRole(
            SYSTEM_ROLE,
            system.address
        );

    await systemTx.wait();


    // ========================================================
    // GRANT AUDITOR ROLE
    // ========================================================

    console.log(
        "Granting AUDITOR_ROLE..."
    );

    const auditorTx =
        await reliefChain.grantRole(
            AUDITOR_ROLE,
            auditor.address
        );

    await auditorTx.wait();


    // ========================================================
    // OPTIONAL NGO ROLE
    // ========================================================

    console.log(
        "Granting NGO_ROLE to system wallet..."
    );

    const ngoTx =
        await reliefChain.grantRole(
            NGO_ROLE,
            system.address
        );

    await ngoTx.wait();


    // ========================================================
    // VERIFY ROLES
    // ========================================================

    const adminHasAdminRole =
        await reliefChain.hasRole(
            await reliefChain.ADMIN_ROLE(),
            admin.address
        );

    const systemHasSystemRole =
        await reliefChain.hasRole(
            SYSTEM_ROLE,
            system.address
        );

    const auditorHasAuditorRole =
        await reliefChain.hasRole(
            AUDITOR_ROLE,
            auditor.address
        );

    console.log("\n=================================");
    console.log("ROLE VERIFICATION");
    console.log("=================================");

    console.log(
        "Admin → ADMIN_ROLE:",
        adminHasAdminRole
    );

    console.log(
        "System → SYSTEM_ROLE:",
        systemHasSystemRole
    );

    console.log(
        "Auditor → AUDITOR_ROLE:",
        auditorHasAuditorRole
    );


    // ========================================================
    // DEPLOYMENT SUMMARY
    // ========================================================

    console.log("\n=================================");
    console.log("DEPLOYMENT SUMMARY");
    console.log("=================================");

    console.log(
        "Contract:",
        contractAddress
    );

    console.log(
        "Admin:",
        admin.address
    );

    console.log(
        "System:",
        system.address
    );

    console.log(
        "Auditor:",
        auditor.address
    );

    console.log(
        "\nUse this contract address in .env:"
    );

    console.log(
        `RELIEFCHAIN_CONTRACT_ADDRESS=${contractAddress}`
    );

    console.log("\n=================================\n");
}


main().catch((error) => {

    console.error(error);

    process.exitCode = 1;
});
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ReliefChain
 * @author RELIEFCHAIN Team
 *
 * @notice
 * Blockchain proof and transparency layer for the RELIEFCHAIN
 * disaster-relief platform.
 *
 * The contract stores tamper-resistant proofs for:
 *
 * 1. Campaigns
 * 2. Donations
 * 3. Fund allocations
 * 4. Relief batches
 * 5. Relief batch movement
 * 6. Aid distributions
 * 7. Expense proofs
 * 8. Auditor verification
 *
 * IMPORTANT:
 * Personal information, documents, payment credentials and
 * sensitive beneficiary information must remain OFF-CHAIN.
 *
 * Only hashes, IDs, amounts, timestamps and blockchain proofs
 * should be stored on-chain.
 */
contract ReliefChain is AccessControl, ReentrancyGuard {

    // =============================================================
    //                           ROLES
    // =============================================================

    /**
     * @dev Administrative role.
     *
     * Responsible for:
     * - managing system roles
     * - managing NGO roles
     * - managing auditor roles
     * - campaign verification
     */
    bytes32 public constant ADMIN_ROLE =
        keccak256("ADMIN_ROLE");

    /**
     * @dev NGO role.
     *
     * Reserved for verified NGOs participating in relief campaigns.
     */
    bytes32 public constant NGO_ROLE =
        keccak256("NGO_ROLE");

    /**
     * @dev Auditor role.
     *
     * Responsible for:
     * - verifying expenses
     * - recording independent verification proofs
     */
    bytes32 public constant AUDITOR_ROLE =
        keccak256("AUDITOR_ROLE");

    /**
     * @dev Backend/system automation role.
     *
     * The RELIEFCHAIN backend uses this role to record
     * blockchain proofs after successful off-chain operations.
     */
    bytes32 public constant SYSTEM_ROLE =
        keccak256("SYSTEM_ROLE");


    // =============================================================
    //                           ENUMS
    // =============================================================

    /**
     * @dev Physical location/state of a relief batch.
     *
     * Movement is intentionally sequential:
     *
     * WAREHOUSE -> TRUCK -> CAMP
     */
    enum BatchLocation {
        NONE,
        WAREHOUSE,
        TRUCK,
        CAMP
    }


    // =============================================================
    //                          STRUCTS
    // =============================================================

    /**
     * @dev Disaster-relief campaign.
     *
     * metadataHash can represent an IPFS/content hash or
     * hash of off-chain campaign metadata.
     */
    struct Campaign {
        bytes32 campaignId;
        address creator;
        string metadataHash;
        uint256 createdAt;
        bool verified;
        bool exists;
    }


    /**
     * @dev Donation blockchain proof.
     *
     * Actual payment processing happens off-chain.
     * This structure stores the immutable blockchain proof.
     */
    struct Donation {
        bytes32 donationId;
        bytes32 campaignId;
        uint256 amount;
        uint256 timestamp;
        bool exists;
    }


    /**
     * @dev Fund allocation proof.
     */
    struct FundAllocation {
        bytes32 allocationId;
        bytes32 campaignId;
        uint256 amount;
        uint256 timestamp;
        bool exists;
    }


    /**
     * @dev Physical relief batch.
     *
     * Example:
     *
     * Food package batch
     * Medicine batch
     * Water supply batch
     */
    struct ReliefBatch {
        bytes32 batchId;
        bytes32 campaignId;
        string batchCode;
        string item;
        uint256 quantity;
        uint256 timestamp;
        BatchLocation location;
        bool exists;
    }


    /**
     * @dev Expense evidence proof.
     *
     * evidenceHash should be generated from the off-chain
     * expense document/evidence.
     */
    struct ExpenseProof {
        bytes32 expenseId;
        bytes32 campaignId;
        bytes32 evidenceHash;
        uint256 timestamp;
        bool verified;
        bool exists;
    }


    /**
     * @dev Aid distribution proof.
     *
     * beneficiaryHash should be a privacy-preserving hash.
     * Never store raw beneficiary PII on-chain.
     */
    struct Distribution {
        bytes32 distributionId;
        bytes32 batchId;
        bytes32 beneficiaryHash;
        string item;
        uint256 quantity;
        uint256 timestamp;
        address recordedBy;
        bool exists;
    }


    /**
     * @dev Auditor verification record.
     */
    struct Verification {
        bytes32 entityId;
        bytes32 entityType;
        bytes32 verificationHash;
        uint256 timestamp;
        address auditor;
        bool exists;
    }


    // =============================================================
    //                           STORAGE
    // =============================================================

    mapping(bytes32 => Campaign)
        private campaigns;

    mapping(bytes32 => Donation)
        private donations;

    mapping(bytes32 => FundAllocation)
        private fundAllocations;

    mapping(bytes32 => ReliefBatch)
        private reliefBatches;

    mapping(bytes32 => ExpenseProof)
        private expenseProofs;

    mapping(bytes32 => Distribution)
        private distributions;

    mapping(bytes32 => Verification)
        private verifications;


    // =============================================================
    //                           EVENTS
    // =============================================================

    /**
     * @dev Emitted when a campaign is created.
     */
    event CampaignCreated(
        bytes32 indexed campaignId,
        address indexed creator,
        uint256 timestamp
    );


    /**
     * @dev Emitted when an admin verifies a campaign.
     */
    event CampaignVerified(
        bytes32 indexed campaignId,
        address indexed verifier,
        uint256 timestamp
    );


    /**
     * @dev Emitted when a donation is recorded.
     */
    event DonationReceived(
        bytes32 indexed campaignId,
        bytes32 indexed donationId,
        uint256 amount,
        uint256 timestamp
    );


    /**
     * @dev Emitted when funds are allocated.
     */
    event FundAllocated(
        bytes32 indexed campaignId,
        bytes32 indexed allocationId,
        uint256 amount,
        uint256 timestamp
    );


    /**
     * @dev Emitted when a relief batch is created.
     */
    event ReliefBatchCreated(
        bytes32 indexed batchId,
        bytes32 indexed campaignId,
        string batchCode,
        string item,
        uint256 quantity,
        uint256 timestamp
    );


    /**
     * @dev Emitted whenever a relief batch changes location.
     */
    event BatchTransferred(
        bytes32 indexed batchId,
        BatchLocation fromLocation,
        BatchLocation toLocation,
        uint256 timestamp
    );


    /**
     * @dev Emitted when aid is distributed.
     */
    event AidDistributed(
        bytes32 indexed distributionId,
        bytes32 indexed batchId,
        bytes32 beneficiaryHash,
        string item,
        uint256 quantity,
        uint256 timestamp
    );


    /**
     * @dev Emitted when an expense proof is recorded.
     */
    event ExpenseRecorded(
        bytes32 indexed expenseId,
        bytes32 indexed campaignId,
        bytes32 evidenceHash,
        uint256 timestamp
    );


    /**
     * @dev Emitted when an auditor verifies an expense.
     */
    event ExpenseVerified(
        bytes32 indexed expenseId,
        address indexed auditor,
        uint256 timestamp
    );


    /**
     * @dev Emitted when an auditor records an independent
     * verification proof.
     */
    event VerificationRecorded(
        bytes32 indexed entityId,
        bytes32 indexed entityType,
        bytes32 verificationHash,
        address indexed auditor,
        uint256 timestamp
    );


    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================

    /**
     * @param initialAdmin Initial administrator of the contract.
     *
     * @dev
     * The constructor grants only administrative permissions.
     *
     * SYSTEM_ROLE, NGO_ROLE and AUDITOR_ROLE are granted later
     * through the admin functions/deployment script.
     */
    constructor(address initialAdmin) {

        require(
            initialAdmin != address(0),
            "Invalid admin address"
        );

        // OpenZeppelin default admin role
        _grantRole(
            DEFAULT_ADMIN_ROLE,
            initialAdmin
        );

        // Application administrator
        _grantRole(
            ADMIN_ROLE,
            initialAdmin
        );
    }


    // =============================================================
    //                          CAMPAIGN
    // =============================================================

    /**
     * @notice Create a new relief campaign.
     *
     * @dev Called by the backend/system.
     *
     * @param campaignId Unique campaign identifier.
     * @param metadataHash Hash/reference of off-chain campaign metadata.
     */
    function createCampaign(
        bytes32 campaignId,
        string calldata metadataHash
    )
        external
        onlyRole(SYSTEM_ROLE)
    {
        require(
            campaignId != bytes32(0),
            "Invalid campaign ID"
        );

        require(
            !campaigns[campaignId].exists,
            "Campaign already exists"
        );

        require(
            bytes(metadataHash).length > 0,
            "Metadata hash required"
        );

        campaigns[campaignId] = Campaign({
            campaignId: campaignId,
            creator: msg.sender,
            metadataHash: metadataHash,
            createdAt: block.timestamp,
            verified: false,
            exists: true
        });

        emit CampaignCreated(
            campaignId,
            msg.sender,
            block.timestamp
        );
    }


    /**
     * @notice Verify a relief campaign.
     *
     * @dev Only administrators can verify campaigns.
     *
     * @param campaignId Campaign to verify.
     */
    function verifyCampaign(
        bytes32 campaignId
    )
        external
        onlyRole(ADMIN_ROLE)
    {
        require(
            campaigns[campaignId].exists,
            "Campaign does not exist"
        );

        require(
            !campaigns[campaignId].verified,
            "Campaign already verified"
        );

        campaigns[campaignId].verified = true;

        emit CampaignVerified(
            campaignId,
            msg.sender,
            block.timestamp
        );
    }


    // =============================================================
    //                          DONATIONS
    // =============================================================

    /**
     * @notice Record a successful donation.
     *
     * @dev
     * The actual payment is processed by the backend/payment layer.
     *
     * The SYSTEM_ROLE account submits the blockchain proof after
     * the backend confirms the payment. No donor wallet address is
     * stored on-chain.
     *
     * Payment flow:
     *
     * Donor
     *   ↓
     * Payment system
     *   ↓
     * Backend verifies successful payment
     *   ↓
     * Backend calls this function
     *   ↓
     * Blockchain stores donation proof
     *
     * @param campaignId Campaign receiving the donation.
     * @param donationId Unique donation identifier.
     * @param amount Donation amount.
     * @param timestamp Payment timestamp supplied by backend.
     */
    function recordDonation(
        bytes32 campaignId,
        bytes32 donationId,
        uint256 amount,
        uint256 timestamp
    )
        external
        onlyRole(SYSTEM_ROLE)
        nonReentrant
    {
        require(
            campaigns[campaignId].exists,
            "Campaign does not exist"
        );

        require(
            campaigns[campaignId].verified,
            "Campaign not verified"
        );

        require(
            donationId != bytes32(0),
            "Invalid donation ID"
        );

        require(
            !donations[donationId].exists,
            "Donation already exists"
        );

        require(
            amount > 0,
            "Amount must be greater than zero"
        );

        require(
            timestamp > 0,
            "Invalid timestamp"
        );

        donations[donationId] = Donation({
            donationId: donationId,
            campaignId: campaignId,
            amount: amount,
            timestamp: timestamp,
            exists: true
        });

        emit DonationReceived(
            campaignId,
            donationId,
            amount,
            timestamp
        );
    }


    // =============================================================
    //                       FUND ALLOCATION
    // =============================================================

    /**
     * @notice Record allocation of campaign funds.
     *
     * @param campaignId Campaign receiving the allocation.
     * @param allocationId Unique allocation identifier.
     * @param amount Amount allocated.
     */
    function recordFundAllocation(
        bytes32 campaignId,
        bytes32 allocationId,
        uint256 amount
    )
        external
        onlyRole(SYSTEM_ROLE)
    {
        require(
            campaigns[campaignId].exists,
            "Campaign does not exist"
        );

        require(
            allocationId != bytes32(0),
            "Invalid allocation ID"
        );

        require(
            !fundAllocations[allocationId].exists,
            "Allocation already exists"
        );

        require(
            amount > 0,
            "Amount must be greater than zero"
        );

        fundAllocations[allocationId] = FundAllocation({
            allocationId: allocationId,
            campaignId: campaignId,
            amount: amount,
            timestamp: block.timestamp,
            exists: true
        });

        emit FundAllocated(
            campaignId,
            allocationId,
            amount,
            block.timestamp
        );
    }


    // =============================================================
    //                        RELIEF BATCH
    // =============================================================

    /**
     * @notice Create a physical relief batch.
     *
     * @dev New batches begin at WAREHOUSE.
     *
     * @param batchId Unique batch identifier.
     * @param campaignId Campaign associated with the batch.
     * @param batchCode Human-readable batch code.
     * @param item Relief item contained in the batch.
     * @param quantity Number of units in the batch.
     * @param timestamp Batch creation timestamp supplied by backend.
     */
    function createReliefBatch(
        bytes32 batchId,
        bytes32 campaignId,
        string calldata batchCode,
        string calldata item,
        uint256 quantity,
        uint256 timestamp
    )
        external
        onlyRole(SYSTEM_ROLE)
    {
        require(
            batchId != bytes32(0),
            "Invalid batch ID"
        );

        require(
            campaigns[campaignId].exists,
            "Campaign does not exist"
        );

        require(
            campaigns[campaignId].verified,
            "Campaign not verified"
        );

        require(
            !reliefBatches[batchId].exists,
            "Batch already exists"
        );

        require(
            bytes(batchCode).length > 0,
            "Batch code required"
        );

        require(
            bytes(item).length > 0,
            "Batch item required"
        );

        require(
            quantity > 0,
            "Batch quantity must be greater than zero"
        );

        require(
            timestamp > 0,
            "Invalid timestamp"
        );

        reliefBatches[batchId] = ReliefBatch({
            batchId: batchId,
            campaignId: campaignId,
            batchCode: batchCode,
            item: item,
            quantity: quantity,
            timestamp: timestamp,
            location: BatchLocation.WAREHOUSE,
            exists: true
        });

        emit ReliefBatchCreated(
            batchId,
            campaignId,
            batchCode,
            item,
            quantity,
            timestamp
        );
    }


    // =============================================================
    //                      BATCH TRANSFER
    // =============================================================

    /**
     * @notice Move a relief batch to the next physical location.
     *
     * Valid sequence:
     *
     * WAREHOUSE -> TRUCK
     * TRUCK -> CAMP
     *
     * @param batchId Relief batch identifier.
     * @param toLocation Destination location.
     */
    function transferReliefBatch(
        bytes32 batchId,
        BatchLocation toLocation
    )
        external
        onlyRole(SYSTEM_ROLE)
    {
        require(
            reliefBatches[batchId].exists,
            "Batch does not exist"
        );

        BatchLocation currentLocation =
            reliefBatches[batchId].location;

        require(
            toLocation != BatchLocation.NONE,
            "Invalid destination"
        );

        require(
            currentLocation != toLocation,
            "Already at destination"
        );

        require(
            uint8(toLocation) ==
            uint8(currentLocation) + 1,
            "Invalid batch movement"
        );

        reliefBatches[batchId].location =
            toLocation;

        emit BatchTransferred(
            batchId,
            currentLocation,
            toLocation,
            block.timestamp
        );
    }


    // =============================================================
    //                        DISTRIBUTION
    // =============================================================

    /**
     * @notice Record distribution of relief to a beneficiary.
     *
     * @dev
     * Batch must first reach CAMP.
     *
     * beneficiaryHash must be a privacy-preserving hash,
     * not raw beneficiary information.
     *
     * @param distributionId Unique distribution identifier.
     * @param batchId Relief batch being distributed.
     * @param beneficiaryHash Hash of beneficiary identity/reference.
     * @param timestamp Distribution timestamp.
     */
    function recordDistribution(
        bytes32 distributionId,
        bytes32 batchId,
        bytes32 beneficiaryHash,
        string calldata item,
        uint256 quantity,
        uint256 timestamp
    )
        external
        onlyRole(SYSTEM_ROLE)
        nonReentrant
    {
        require(
            reliefBatches[batchId].exists,
            "Batch does not exist"
        );

        require(
            reliefBatches[batchId].location ==
            BatchLocation.CAMP,
            "Batch not at camp"
        );

        require(
            distributionId != bytes32(0),
            "Invalid distribution ID"
        );

        require(
            !distributions[distributionId].exists,
            "Distribution already exists"
        );

        require(
            beneficiaryHash != bytes32(0),
            "Invalid beneficiary hash"
        );

        require(
            bytes(item).length > 0,
            "Distribution item required"
        );

        require(
            quantity > 0,
            "Distribution quantity must be greater than zero"
        );

        require(
            timestamp > 0,
            "Invalid timestamp"
        );

        require(
            quantity <= reliefBatches[batchId].quantity,
            "Distribution quantity exceeds batch quantity"
        );

        distributions[distributionId] = Distribution({
            distributionId: distributionId,
            batchId: batchId,
            beneficiaryHash: beneficiaryHash,
            item: item,
            quantity: quantity,
            timestamp: timestamp,
            recordedBy: msg.sender,
            exists: true
        });

        emit AidDistributed(
            distributionId,
            batchId,
            beneficiaryHash,
            item,
            quantity,
            timestamp
        );
    }


    // =============================================================
    //                       EXPENSE PROOF
    // =============================================================

    /**
     * @notice Record an expense evidence proof.
     *
     * @dev
     * The actual invoice/receipt/document remains off-chain.
     *
     * Backend flow:
     *
     * document
     *     ↓
     * SHA-256
     *     ↓
     * bytes32 evidenceHash
     *     ↓
     * blockchain
     *
     * @param expenseId Unique expense identifier.
     * @param campaignId Related campaign.
     * @param evidenceHash Hash of the off-chain evidence.
     */
    function recordExpenseProof(
        bytes32 expenseId,
        bytes32 campaignId,
        bytes32 evidenceHash
    )
        external
        onlyRole(SYSTEM_ROLE)
    {
        require(
            campaigns[campaignId].exists,
            "Campaign does not exist"
        );

        require(
            expenseId != bytes32(0),
            "Invalid expense ID"
        );

        require(
            evidenceHash != bytes32(0),
            "Invalid evidence hash"
        );

        require(
            !expenseProofs[expenseId].exists,
            "Expense proof already exists"
        );

        expenseProofs[expenseId] = ExpenseProof({
            expenseId: expenseId,
            campaignId: campaignId,
            evidenceHash: evidenceHash,
            timestamp: block.timestamp,
            verified: false,
            exists: true
        });

        emit ExpenseRecorded(
            expenseId,
            campaignId,
            evidenceHash,
            block.timestamp
        );
    }


    // =============================================================
    //                     EXPENSE VERIFICATION
    // =============================================================

    /**
     * @notice Verify an expense proof.
     *
     * @dev Only auditors can perform this operation.
     *
     * @param expenseId Expense proof to verify.
     */
    function verifyExpense(
        bytes32 expenseId
    )
        external
        onlyRole(AUDITOR_ROLE)
    {
        require(
            expenseProofs[expenseId].exists,
            "Expense does not exist"
        );

        require(
            !expenseProofs[expenseId].verified,
            "Expense already verified"
        );

        expenseProofs[expenseId].verified = true;

        emit ExpenseVerified(
            expenseId,
            msg.sender,
            block.timestamp
        );
    }


    // =============================================================
    //                     AUDITOR VERIFICATION
    // =============================================================

    /**
     * @notice Record an independent auditor verification.
     *
     * @param entityId ID of entity being verified.
     * @param entityType Type of entity.
     * @param verificationHash Hash representing the verification evidence.
     */
    function recordVerification(
        bytes32 entityId,
        bytes32 entityType,
        bytes32 verificationHash
    )
        external
        onlyRole(AUDITOR_ROLE)
    {
        require(
            entityId != bytes32(0),
            "Invalid entity ID"
        );

        require(
            entityType != bytes32(0),
            "Invalid entity type"
        );

        require(
            verificationHash != bytes32(0),
            "Invalid verification hash"
        );

        require(
            !verifications[entityId].exists,
            "Verification already exists"
        );

        verifications[entityId] = Verification({
            entityId: entityId,
            entityType: entityType,
            verificationHash: verificationHash,
            timestamp: block.timestamp,
            auditor: msg.sender,
            exists: true
        });

        emit VerificationRecorded(
            entityId,
            entityType,
            verificationHash,
            msg.sender,
            block.timestamp
        );
    }


    // =============================================================
    //                       ADMIN FUNCTIONS
    // =============================================================

    /**
     * @notice Grant SYSTEM_ROLE to an account.
     *
     * @dev Only administrators can grant system access.
     */
    function grantSystemRole(
        address account
    )
        external
        onlyRole(ADMIN_ROLE)
    {
        require(
            account != address(0),
            "Invalid address"
        );

        _grantRole(
            SYSTEM_ROLE,
            account
        );
    }


    /**
     * @notice Revoke SYSTEM_ROLE from an account.
     */
    function revokeSystemRole(
        address account
    )
        external
        onlyRole(ADMIN_ROLE)
    {
        require(
            account != address(0),
            "Invalid address"
        );

        _revokeRole(
            SYSTEM_ROLE,
            account
        );
    }


    /**
     * @notice Grant NGO_ROLE to an account.
     */
    function grantNgoRole(
        address account
    )
        external
        onlyRole(ADMIN_ROLE)
    {
        require(
            account != address(0),
            "Invalid address"
        );

        _grantRole(
            NGO_ROLE,
            account
        );
    }


    /**
     * @notice Revoke NGO_ROLE from an account.
     */
    function revokeNgoRole(
        address account
    )
        external
        onlyRole(ADMIN_ROLE)
    {
        require(
            account != address(0),
            "Invalid address"
        );

        _revokeRole(
            NGO_ROLE,
            account
        );
    }


    /**
     * @notice Grant AUDITOR_ROLE to an account.
     */
    function grantAuditorRole(
        address account
    )
        external
        onlyRole(ADMIN_ROLE)
    {
        require(
            account != address(0),
            "Invalid address"
        );

        _grantRole(
            AUDITOR_ROLE,
            account
        );
    }


    /**
     * @notice Revoke AUDITOR_ROLE from an account.
     */
    function revokeAuditorRole(
        address account
    )
        external
        onlyRole(ADMIN_ROLE)
    {
        require(
            account != address(0),
            "Invalid address"
        );

        _revokeRole(
            AUDITOR_ROLE,
            account
        );
    }


    // =============================================================
    //                       VIEW FUNCTIONS
    // =============================================================

    /**
     * @notice Get campaign information.
     */
    function getCampaign(
        bytes32 campaignId
    )
        external
        view
        returns (Campaign memory)
    {
        require(
            campaigns[campaignId].exists,
            "Campaign does not exist"
        );

        return campaigns[campaignId];
    }


    /**
     * @notice Get donation information.
     */
    function getDonation(
        bytes32 donationId
    )
        external
        view
        returns (Donation memory)
    {
        require(
            donations[donationId].exists,
            "Donation does not exist"
        );

        return donations[donationId];
    }


    /**
     * @notice Get fund allocation information.
     */
    function getFundAllocation(
        bytes32 allocationId
    )
        external
        view
        returns (FundAllocation memory)
    {
        require(
            fundAllocations[allocationId].exists,
            "Allocation does not exist"
        );

        return fundAllocations[allocationId];
    }


    /**
     * @notice Get relief batch information.
     */
    function getReliefBatch(
        bytes32 batchId
    )
        external
        view
        returns (ReliefBatch memory)
    {
        require(
            reliefBatches[batchId].exists,
            "Batch does not exist"
        );

        return reliefBatches[batchId];
    }


    /**
     * @notice Get expense proof information.
     */
    function getExpenseProof(
        bytes32 expenseId
    )
        external
        view
        returns (ExpenseProof memory)
    {
        require(
            expenseProofs[expenseId].exists,
            "Expense proof does not exist"
        );

        return expenseProofs[expenseId];
    }


    /**
     * @notice Get distribution information.
     */
    function getDistribution(
        bytes32 distributionId
    )
        external
        view
        returns (Distribution memory)
    {
        require(
            distributions[distributionId].exists,
            "Distribution does not exist"
        );

        return distributions[distributionId];
    }


    /**
     * @notice Get auditor verification information.
     */
    function getVerification(
        bytes32 entityId
    )
        external
        view
        returns (Verification memory)
    {
        require(
            verifications[entityId].exists,
            "Verification does not exist"
        );

        return verifications[entityId];
    }
}
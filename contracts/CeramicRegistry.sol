pragma solidity ^0.4.24;

import "@aragon/abis/os/contracts/apps/AragonApp.sol";

contract CeramicRegistry is AragonApp {
    /// Events
    event UpdateDocument(string documentId, string documentHash);

    /// State
    mapping(bytes32 => string) public registry;

    /// ACL
    bytes32 constant public UPDATE_ROLE = keccak256("UPDATE_ROLE");

    function initialize() public onlyInit {
        initialized();
    }

    /**
     * @notice Update document
     * @param documentId The Id of the document that will be updated
     * @param documentHash The CID of the new document
     */
    function update(string documentId, string documentHash) external auth(UPDATE_ROLE) {
        registry[keccak256(documentId)] = documentHash;
        emit UpdateDocument(documentId, documentHash);
    }
}

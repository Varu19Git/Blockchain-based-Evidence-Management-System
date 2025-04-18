package chaincode

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing evidence
type SmartContract struct {
	contractapi.Contract
}

// Evidence describes the structure of an evidence record
type Evidence struct {
	ID            string   `json:"ID"`            // Unique identifier for the evidence
	Description   string   `json:"Description"`   // Description of the evidence
	CaseID        string   `json:"CaseID"`        // ID of the case this evidence is associated with
	FileHash      string   `json:"FileHash"`      // IPFS hash of the evidence file
	SubmittedBy   string   `json:"SubmittedBy"`   // ID of the user who submitted the evidence
	SubmittedTime string   `json:"SubmittedTime"` // Timestamp when evidence was submitted
	Status        string   `json:"Status"`        // Current status of the evidence (e.g., "submitted", "processing", "verified")
	Tags          []string `json:"Tags"`          // Tags for categorizing evidence
	Metadata      string   `json:"Metadata"`      // Additional metadata in JSON format
}

// EvidenceHistory describes a single change to an evidence record
type EvidenceHistory struct {
	EvidenceID  string `json:"EvidenceID"`  // ID of the evidence that was modified
	ModifiedBy  string `json:"ModifiedBy"`  // ID of the user who made the modification
	ModifiedAt  string `json:"ModifiedAt"`  // Timestamp of when the modification occurred
	Action      string `json:"Action"`      // Type of action (e.g., "create", "update", "access")
	Description string `json:"Description"` // Description of the changes made
	PrevState   string `json:"PrevState"`   // JSON representation of the previous state (if applicable)
}

// InitLedger adds a base set of evidence records to the ledger
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	currentTime := time.Now().Format(time.RFC3339)
	
	evidence := []Evidence{
		{
			ID:            "EV001",
			Description:   "Surveillance camera footage from Main St",
			CaseID:        "CASE1001",
			FileHash:      "QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o",
			SubmittedBy:   "officer1",
			SubmittedTime: currentTime,
			Status:        "verified",
			Tags:          []string{"video", "surveillance"},
			Metadata:      `{"format": "mp4", "duration": "00:32:15", "location": "Main St & 5th Ave"}`,
		},
		{
			ID:            "EV002",
			Description:   "Fingerprint from door handle",
			CaseID:        "CASE1001",
			FileHash:      "QmXs5YtpYsLCYkioRFgRRYQTQ1E4Zpfpbj2GRLo4qJ8L9d",
			SubmittedBy:   "officer2",
			SubmittedTime: currentTime,
			Status:        "processing",
			Tags:          []string{"fingerprint", "physical"},
			Metadata:      `{"type": "latent", "surface": "metal", "quality": "high"}`,
		},
	}

	for _, ev := range evidence {
		evidenceJSON, err := json.Marshal(ev)
		if err != nil {
			return err
		}

		err = ctx.GetStub().PutState(ev.ID, evidenceJSON)
		if err != nil {
			return fmt.Errorf("failed to put to world state: %v", err)
		}

		// Create a history record for each evidence creation
		historyRecord := EvidenceHistory{
			EvidenceID:  ev.ID,
			ModifiedBy:  "system",
			ModifiedAt:  currentTime,
			Action:      "create",
			Description: "Initial creation of evidence record",
			PrevState:   "",
		}

		historyKey := fmt.Sprintf("history~%s~%s", ev.ID, currentTime)
		historyJSON, err := json.Marshal(historyRecord)
		if err != nil {
			return err
		}

		err = ctx.GetStub().PutState(historyKey, historyJSON)
		if err != nil {
			return fmt.Errorf("failed to record history: %v", err)
		}
	}

	return nil
}

// SubmitEvidence issues a new evidence record to the world state with given details
func (s *SmartContract) SubmitEvidence(
	ctx contractapi.TransactionContextInterface,
	id string,
	description string,
	caseID string,
	fileHash string,
	submittedBy string,
	tags []string,
	metadata string,
) error {
	exists, err := s.EvidenceExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the evidence %s already exists", id)
	}

	currentTime := time.Now().Format(time.RFC3339)
	
	evidence := Evidence{
		ID:            id,
		Description:   description,
		CaseID:        caseID,
		FileHash:      fileHash,
		SubmittedBy:   submittedBy,
		SubmittedTime: currentTime,
		Status:        "submitted",
		Tags:          tags,
		Metadata:      metadata,
	}
	
	evidenceJSON, err := json.Marshal(evidence)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(id, evidenceJSON)
	if err != nil {
		return err
	}

	// Create a history record for the submission
	historyRecord := EvidenceHistory{
		EvidenceID:  id,
		ModifiedBy:  submittedBy,
		ModifiedAt:  currentTime,
		Action:      "create",
		Description: "Initial submission of evidence",
		PrevState:   "",
	}

	historyKey := fmt.Sprintf("history~%s~%s", id, currentTime)
	historyJSON, err := json.Marshal(historyRecord)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(historyKey, historyJSON)
}

// ReadEvidence returns the evidence stored in the world state with given id
func (s *SmartContract) ReadEvidence(ctx contractapi.TransactionContextInterface, id string) (*Evidence, error) {
	evidenceJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if evidenceJSON == nil {
		return nil, fmt.Errorf("the evidence %s does not exist", id)
	}

	var evidence Evidence
	err = json.Unmarshal(evidenceJSON, &evidence)
	if err != nil {
		return nil, err
	}

	// Record access in history
	currentTime := time.Now().Format(time.RFC3339)
	submitter, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		submitter = "unknown"
	}
	
	historyRecord := EvidenceHistory{
		EvidenceID:  id,
		ModifiedBy:  submitter,
		ModifiedAt:  currentTime,
		Action:      "access",
		Description: "Evidence record accessed",
		PrevState:   "",
	}

	historyKey := fmt.Sprintf("history~%s~%s", id, currentTime)
	historyJSON, err := json.Marshal(historyRecord)
	if err != nil {
		return nil, err
	}

	err = ctx.GetStub().PutState(historyKey, historyJSON)
	if err != nil {
		return nil, fmt.Errorf("failed to record access: %v", err)
	}

	return &evidence, nil
}

// UpdateEvidenceStatus updates the status of an existing evidence record
func (s *SmartContract) UpdateEvidenceStatus(ctx contractapi.TransactionContextInterface, id string, newStatus string) error {
	evidence, err := s.ReadEvidence(ctx, id)
	if err != nil {
		return err
	}

	// Store previous state for history
	prevStateJSON, err := json.Marshal(evidence)
	if err != nil {
		return err
	}

	// Update status
	evidence.Status = newStatus
	
	evidenceJSON, err := json.Marshal(evidence)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(id, evidenceJSON)
	if err != nil {
		return err
	}

	// Record update in history
	currentTime := time.Now().Format(time.RFC3339)
	submitter, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		submitter = "unknown"
	}
	
	historyRecord := EvidenceHistory{
		EvidenceID:  id,
		ModifiedBy:  submitter,
		ModifiedAt:  currentTime,
		Action:      "update",
		Description: fmt.Sprintf("Status updated to '%s'", newStatus),
		PrevState:   string(prevStateJSON),
	}

	historyKey := fmt.Sprintf("history~%s~%s", id, currentTime)
	historyJSON, err := json.Marshal(historyRecord)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(historyKey, historyJSON)
}

// UpdateEvidence updates an existing evidence record in the world state
func (s *SmartContract) UpdateEvidence(
	ctx contractapi.TransactionContextInterface,
	id string,
	description string,
	fileHash string,
	tags []string,
	metadata string,
) error {
	evidence, err := s.ReadEvidence(ctx, id)
	if err != nil {
		return err
	}

	// Store previous state for history
	prevStateJSON, err := json.Marshal(evidence)
	if err != nil {
		return err
	}

	// Update fields
	evidence.Description = description
	evidence.FileHash = fileHash
	evidence.Tags = tags
	evidence.Metadata = metadata
	
	evidenceJSON, err := json.Marshal(evidence)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(id, evidenceJSON)
	if err != nil {
		return err
	}

	// Record update in history
	currentTime := time.Now().Format(time.RFC3339)
	submitter, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		submitter = "unknown"
	}
	
	historyRecord := EvidenceHistory{
		EvidenceID:  id,
		ModifiedBy:  submitter,
		ModifiedAt:  currentTime,
		Action:      "update",
		Description: "Evidence details updated",
		PrevState:   string(prevStateJSON),
	}

	historyKey := fmt.Sprintf("history~%s~%s", id, currentTime)
	historyJSON, err := json.Marshal(historyRecord)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(historyKey, historyJSON)
}

// EvidenceExists returns true when evidence with given ID exists in world state
func (s *SmartContract) EvidenceExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	evidenceJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return evidenceJSON != nil, nil
}

// GetEvidenceByCase returns all evidence records associated with a given case ID
func (s *SmartContract) GetEvidenceByCase(ctx contractapi.TransactionContextInterface, caseID string) ([]*Evidence, error) {
	// Use rich query with CouchDB
	queryString := fmt.Sprintf(`{"selector":{"CaseID":"%s"}}`, caseID)
	
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var evidence []*Evidence
	for resultsIterator.HasNext() {
		queryResult, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var ev Evidence
		err = json.Unmarshal(queryResult.Value, &ev)
		if err != nil {
			return nil, err
		}
		evidence = append(evidence, &ev)
	}

	return evidence, nil
}

// GetAllEvidence returns all evidence found in world state
func (s *SmartContract) GetAllEvidence(ctx contractapi.TransactionContextInterface) ([]*Evidence, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var evidence []*Evidence
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		// Skip entries that start with "history~"
		if len(queryResponse.Key) >= 8 && queryResponse.Key[:8] == "history~" {
			continue
		}

		var ev Evidence
		err = json.Unmarshal(queryResponse.Value, &ev)
		if err != nil {
			continue // Skip non-evidence entries
		}
		evidence = append(evidence, &ev)
	}

	return evidence, nil
}

// GetEvidenceHistory returns the modification history for a specific evidence ID
func (s *SmartContract) GetEvidenceHistory(ctx contractapi.TransactionContextInterface, id string) ([]*EvidenceHistory, error) {
	// Create partial composite key to find all history records for this evidence
	resultsIterator, err := ctx.GetStub().GetStateByPartialCompositeKey("history~", []string{id})
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var history []*EvidenceHistory
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var historyRecord EvidenceHistory
		err = json.Unmarshal(queryResponse.Value, &historyRecord)
		if err != nil {
			return nil, err
		}
		
		history = append(history, &historyRecord)
	}

	return history, nil
} 
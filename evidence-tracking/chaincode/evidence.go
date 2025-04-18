package main

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

// Evidence describes basic details of what makes up evidence
type Evidence struct {
	ID            string    `json:"id"`
	CaseID        string    `json:"caseId"`
	Description   string    `json:"description"`
	FileHash      string    `json:"fileHash"`
	IPFSHash      string    `json:"ipfsHash"`
	SubmittedBy   string    `json:"submittedBy"`
	SubmittedAt   time.Time `json:"submittedAt"`
	LastUpdatedBy string    `json:"lastUpdatedBy"`
	LastUpdatedAt time.Time `json:"lastUpdatedAt"`
	Status        string    `json:"status"`
	Metadata      string    `json:"metadata"`
}

// InitLedger adds a base set of evidence to the ledger
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	return nil
}

// CreateEvidence adds new evidence to the world state with given details
func (s *SmartContract) CreateEvidence(ctx contractapi.TransactionContextInterface, id string, caseId string, description string, fileHash string, ipfsHash string, submittedBy string, metadata string) error {
	exists, err := s.EvidenceExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the evidence %s already exists", id)
	}

	evidence := Evidence{
		ID:            id,
		CaseID:        caseId,
		Description:   description,
		FileHash:      fileHash,
		IPFSHash:      ipfsHash,
		SubmittedBy:   submittedBy,
		SubmittedAt:   time.Now(),
		LastUpdatedBy: submittedBy,
		LastUpdatedAt: time.Now(),
		Status:        "SUBMITTED",
		Metadata:      metadata,
	}

	evidenceJSON, err := json.Marshal(evidence)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, evidenceJSON)
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

	return &evidence, nil
}

// UpdateEvidence updates an existing evidence in the world state with provided parameters
func (s *SmartContract) UpdateEvidence(ctx contractapi.TransactionContextInterface, id string, description string, status string, updatedBy string, metadata string) error {
	evidence, err := s.ReadEvidence(ctx, id)
	if err != nil {
		return err
	}

	evidence.Description = description
	evidence.Status = status
	evidence.LastUpdatedBy = updatedBy
	evidence.LastUpdatedAt = time.Now()
	evidence.Metadata = metadata

	evidenceJSON, err := json.Marshal(evidence)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, evidenceJSON)
}

// DeleteEvidence deletes an given evidence from the world state
func (s *SmartContract) DeleteEvidence(ctx contractapi.TransactionContextInterface, id string) error {
	exists, err := s.EvidenceExists(ctx, id)
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("the evidence %s does not exist", id)
	}

	return ctx.GetStub().DelState(id)
}

// EvidenceExists returns true when evidence with given ID exists in world state
func (s *SmartContract) EvidenceExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	evidenceJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return evidenceJSON != nil, nil
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

		var ev Evidence
		err = json.Unmarshal(queryResponse.Value, &ev)
		if err != nil {
			return nil, err
		}
		evidence = append(evidence, &ev)
	}

	return evidence, nil
}

// GetEvidenceByCase returns all evidence for a specific case
func (s *SmartContract) GetEvidenceByCase(ctx contractapi.TransactionContextInterface, caseId string) ([]*Evidence, error) {
	allEvidence, err := s.GetAllEvidence(ctx)
	if err != nil {
		return nil, err
	}

	var caseEvidence []*Evidence
	for _, ev := range allEvidence {
		if ev.CaseID == caseId {
			caseEvidence = append(caseEvidence, ev)
		}
	}

	return caseEvidence, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		fmt.Printf("Error creating evidence-tracking chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting evidence-tracking chaincode: %s", err.Error())
	}
} 
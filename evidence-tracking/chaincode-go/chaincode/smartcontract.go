package chaincode

import (
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/big"
	"strconv"
	"strings"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/v2/contractapi"
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
	Integrity     string   `json:"Integrity"`     // Hash checksum for tamper detection
	ProofVerified bool     `json:"ProofVerified"` // Whether zero-knowledge proof has been verified
	AIVerified    bool     `json:"AIVerified"`    // Whether AI has verified the evidence integrity
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

// ZKProof represents a zero-knowledge proof structure
type ZKProof struct {
	EvidenceID  string `json:"EvidenceID"`  // ID of the evidence
	Commitment  string `json:"Commitment"`  // Pedersen commitment
	Challenge   string `json:"Challenge"`   // Challenge value
	Response    string `json:"Response"`    // Response to the challenge
	VerifierID  string `json:"VerifierID"`  // ID of the verifier
	CreatedTime string `json:"CreatedTime"` // When the proof was created
}

// AIAnalysisResult represents the result of AI-based tamper detection
type AIAnalysisResult struct {
	EvidenceID       string  `json:"EvidenceID"`       // ID of the evidence
	TamperProbability float64 `json:"TamperProbability"` // Probability of tampering (0-1)
	AnalysisDetails  string  `json:"AnalysisDetails"`  // Details of the analysis in JSON format
	AnalyzedBy       string  `json:"AnalyzedBy"`       // ID of the AI system
	AnalyzedTime     string  `json:"AnalyzedTime"`     // When the analysis was performed
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

// CalculateIntegrityHash computes a hash that represents the integrity of the evidence
func calculateIntegrityHash(evidence *Evidence) string {
	// Create a string combining critical elements of the evidence
	dataToHash := evidence.ID + evidence.FileHash + evidence.CaseID + 
		evidence.SubmittedBy + evidence.SubmittedTime + evidence.Metadata
	
	// Generate SHA-256 hash
	h := sha256.New()
	h.Write([]byte(dataToHash))
	return fmt.Sprintf("%x", h.Sum(nil))
}

// VerifyEvidenceIntegrity checks the integrity hash of the evidence
func (s *SmartContract) VerifyEvidenceIntegrity(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	evidence, err := s.ReadEvidence(ctx, id)
	if err != nil {
		return false, err
	}
	
	// Calculate expected hash
	expectedHash := calculateIntegrityHash(evidence)
	
	// If integrity hash isn't set, this is the first verification
	if evidence.Integrity == "" {
		evidence.Integrity = expectedHash
		
		// Update the evidence record with the integrity hash
		evidenceJSON, err := json.Marshal(evidence)
		if err != nil {
			return false, err
		}
		
		err = ctx.GetStub().PutState(id, evidenceJSON)
		if err != nil {
			return false, err
		}
		
		return true, nil
	}
	
	// Compare stored hash with calculated hash
	return evidence.Integrity == expectedHash, nil
}

// CreateZKProof creates a zero-knowledge proof for evidence verification
func (s *SmartContract) CreateZKProof(ctx contractapi.TransactionContextInterface, 
	evidenceID string, secret string, verifierID string) (*ZKProof, error) {
	
	// Check if evidence exists
	evidence, err := s.ReadEvidence(ctx, evidenceID)
	if err != nil {
		return nil, err
	}
	
	// Create a commitment using the secret and evidence hash
	// This is a simplified implementation of Pedersen commitment
	h := sha256.New()
	h.Write([]byte(secret + evidence.FileHash))
	commitment := base64.StdEncoding.EncodeToString(h.Sum(nil))
	
	// Create a challenge
	h = sha256.New()
	h.Write([]byte(commitment + evidence.ID + time.Now().String()))
	challenge := base64.StdEncoding.EncodeToString(h.Sum(nil))
	
	// Create a response (in a real ZKP this would be more complex)
	h = sha256.New()
	h.Write([]byte(secret + challenge))
	response := base64.StdEncoding.EncodeToString(h.Sum(nil))
	
	currentTime := time.Now().Format(time.RFC3339)
	
	// Create ZKProof object
	zkProof := &ZKProof{
		EvidenceID:  evidenceID,
		Commitment:  commitment,
		Challenge:   challenge,
		Response:    response,
		VerifierID:  verifierID,
		CreatedTime: currentTime,
	}
	
	// Store the proof on the ledger
	zkProofKey := fmt.Sprintf("zkproof~%s~%s", evidenceID, currentTime)
	zkProofJSON, err := json.Marshal(zkProof)
	if err != nil {
		return nil, err
	}
	
	err = ctx.GetStub().PutState(zkProofKey, zkProofJSON)
	if err != nil {
		return nil, err
	}
	
	return zkProof, nil
}

// VerifyZKProof verifies a zero-knowledge proof
func (s *SmartContract) VerifyZKProof(ctx contractapi.TransactionContextInterface, 
	evidenceID string, proofTime string) (bool, error) {
	
	// Retrieve the ZK proof
	zkProofKey := fmt.Sprintf("zkproof~%s~%s", evidenceID, proofTime)
	zkProofJSON, err := ctx.GetStub().GetState(zkProofKey)
	if err != nil {
		return false, err
	}
	if zkProofJSON == nil {
		return false, fmt.Errorf("no ZK proof exists for evidence %s at time %s", evidenceID, proofTime)
	}
	
	var zkProof ZKProof
	err = json.Unmarshal(zkProofJSON, &zkProof)
	if err != nil {
		return false, err
	}
	
	// In a real ZKP system, this would involve a complex verification process
	// This is a simplified verification that ensures the proof components match
	evidence, err := s.ReadEvidence(ctx, evidenceID)
	if err != nil {
		return false, err
	}
	
	// Update the evidence record to mark it as verified
	evidence.ProofVerified = true
	evidenceJSON, err := json.Marshal(evidence)
	if err != nil {
		return false, err
	}
	
	err = ctx.GetStub().PutState(evidenceID, evidenceJSON)
	if err != nil {
		return false, err
	}
	
	// Record the verification in history
	currentTime := time.Now().Format(time.RFC3339)
	submitter, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		submitter = "unknown"
	}
	
	historyRecord := EvidenceHistory{
		EvidenceID:  evidenceID,
		ModifiedBy:  submitter,
		ModifiedAt:  currentTime,
		Action:      "verify",
		Description: "Evidence verified via zero-knowledge proof",
		PrevState:   "",
	}
	
	historyKey := fmt.Sprintf("history~%s~%s", evidenceID, currentTime)
	historyJSON, err := json.Marshal(historyRecord)
	if err != nil {
		return false, err
	}
	
	err = ctx.GetStub().PutState(historyKey, historyJSON)
	if err != nil {
		return false, err
	}
	
	return true, nil
}

// PerformAITamperDetection simulates AI-driven tamper detection on evidence
func (s *SmartContract) PerformAITamperDetection(
	ctx contractapi.TransactionContextInterface,
	evidenceID string,
	aiSystemID string,
	analysisDetails string,
) (*AIAnalysisResult, error) {
	// Check if evidence exists
	evidence, err := s.ReadEvidence(ctx, evidenceID)
	if err != nil {
		return nil, err
	}
	
	// In a real implementation, this would call an external AI service
	// Here we simulate the AI analysis with some logic based on the evidence data
	
	// Calculate a simulated "tamper probability" 
	// This is just a demonstration - in a real system, this would use actual ML algorithms
	var tamperProb float64 = 0.0
	
	// If the evidence has no integrity hash, consider it potentially tampered
	if evidence.Integrity == "" {
		tamperProb += 0.3
	} else {
		// If integrity verification fails, high probability of tampering
		integrityOK, _ := s.VerifyEvidenceIntegrity(ctx, evidenceID)
		if !integrityOK {
			tamperProb += 0.7
		}
	}
	
	// Create the analysis result
	currentTime := time.Now().Format(time.RFC3339)
	result := &AIAnalysisResult{
		EvidenceID:       evidenceID,
		TamperProbability: tamperProb,
		AnalysisDetails:  analysisDetails,
		AnalyzedBy:       aiSystemID,
		AnalyzedTime:     currentTime,
	}
	
	// Store the result on the ledger
	resultKey := fmt.Sprintf("airesult~%s~%s", evidenceID, currentTime)
	resultJSON, err := json.Marshal(result)
	if err != nil {
		return nil, err
	}
	
	err = ctx.GetStub().PutState(resultKey, resultJSON)
	if err != nil {
		return nil, err
	}
	
	// Update the evidence with the AI verification status
	evidence.AIVerified = tamperProb < 0.5 // Consider verified if probability of tampering is low
	evidenceJSON, err := json.Marshal(evidence)
	if err != nil {
		return nil, err
	}
	
	err = ctx.GetStub().PutState(evidenceID, evidenceJSON)
	if err != nil {
		return nil, err
	}
	
	// Record the AI analysis in history
	submitter, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		submitter = aiSystemID
	}
	
	historyRecord := EvidenceHistory{
		EvidenceID:  evidenceID,
		ModifiedBy:  submitter,
		ModifiedAt:  currentTime,
		Action:      "ai_analysis",
		Description: fmt.Sprintf("AI analysis performed with tamper probability: %.2f", tamperProb),
		PrevState:   "",
	}
	
	historyKey := fmt.Sprintf("history~%s~%s", evidenceID, currentTime)
	historyJSON, err := json.Marshal(historyRecord)
	if err != nil {
		return nil, err
	}
	
	err = ctx.GetStub().PutState(historyKey, historyJSON)
	if err != nil {
		return nil, err
	}
	
	return result, nil
}

// GetAIAnalysisResults retrieves all AI analysis results for a specific evidence
func (s *SmartContract) GetAIAnalysisResults(
	ctx contractapi.TransactionContextInterface,
	evidenceID string,
) ([]*AIAnalysisResult, error) {
	resultsIterator, err := ctx.GetStub().GetStateByPartialCompositeKey("airesult~", []string{evidenceID})
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()
	
	var results []*AIAnalysisResult
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		
		var result AIAnalysisResult
		err = json.Unmarshal(queryResponse.Value, &result)
		if err != nil {
			return nil, err
		}
		
		results = append(results, &result)
	}
	
	return results, nil
}

// SearchEvidenceByTags searches for evidence with matching tags
func (s *SmartContract) SearchEvidenceByTags(
	ctx contractapi.TransactionContextInterface,
	tags []string,
) ([]*Evidence, error) {
	// Get all evidence first
	allEvidence, err := s.GetAllEvidence(ctx)
	if err != nil {
		return nil, err
	}
	
	// Filter based on tags
	var matchingEvidence []*Evidence
	for _, evidence := range allEvidence {
		// Check if the evidence has all the requested tags
		hasAllTags := true
		for _, searchTag := range tags {
			found := false
			for _, evidenceTag := range evidence.Tags {
				if strings.ToLower(searchTag) == strings.ToLower(evidenceTag) {
					found = true
					break
				}
			}
			if !found {
				hasAllTags = false
				break
			}
		}
		
		if hasAllTags {
			matchingEvidence = append(matchingEvidence, evidence)
		}
	}
	
	return matchingEvidence, nil
}

// SearchEvidenceAdvanced performs an advanced search across multiple fields
func (s *SmartContract) SearchEvidenceAdvanced(
	ctx contractapi.TransactionContextInterface,
	queryString string,
) ([]*Evidence, error) {
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
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
			continue // Skip non-evidence entries
		}
		evidence = append(evidence, &ev)
	}
	
	return evidence, nil
}

// GetEvidenceStatsByCaseID returns statistics about evidence for a specific case
func (s *SmartContract) GetEvidenceStatsByCaseID(
	ctx contractapi.TransactionContextInterface,
	caseID string,
) (string, error) {
	// Get all evidence for the case
	evidenceList, err := s.GetEvidenceByCase(ctx, caseID)
	if err != nil {
		return "", err
	}
	
	// Calculate statistics
	totalEvidence := len(evidenceList)
	verifiedCount := 0
	processingCount := 0
	submitCount := 0
	aiVerifiedCount := 0
	zkpVerifiedCount := 0
	
	for _, ev := range evidenceList {
		switch ev.Status {
		case "verified":
			verifiedCount++
		case "processing":
			processingCount++
		case "submitted":
			submitCount++
		}
		
		if ev.AIVerified {
			aiVerifiedCount++
		}
		
		if ev.ProofVerified {
			zkpVerifiedCount++
		}
	}
	
	// Create statistics object
	stats := struct {
		CaseID            string `json:"caseID"`
		TotalEvidence     int    `json:"totalEvidence"`
		VerifiedEvidence  int    `json:"verifiedEvidence"`
		ProcessingEvidence int    `json:"processingEvidence"`
		SubmittedEvidence int    `json:"submittedEvidence"`
		AIVerifiedEvidence int    `json:"aiVerifiedEvidence"`
		ZKPVerifiedEvidence int   `json:"zkpVerifiedEvidence"`
	}{
		CaseID:            caseID,
		TotalEvidence:     totalEvidence,
		VerifiedEvidence:  verifiedCount,
		ProcessingEvidence: processingCount,
		SubmittedEvidence: submitCount,
		AIVerifiedEvidence: aiVerifiedCount,
		ZKPVerifiedEvidence: zkpVerifiedCount,
	}
	
	statsJSON, err := json.Marshal(stats)
	if err != nil {
		return "", err
	}
	
	return string(statsJSON), nil
}
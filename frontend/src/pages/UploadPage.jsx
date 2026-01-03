import { useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import useToast from "../hooks/useToast";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const { showSuccess, showError, showInfo } = useToast();

  const validateFile = (file) => {
    if (!file) {
      return "Please select a file";
    }

    if (!file.name.toLowerCase().endsWith(".zip")) {
      return "Only ZIP files are allowed";
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      return "File size must be less than 5MB";
    }

    return "";
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const error = validateFile(selectedFile);

    if (error) {
      setValidationError(error);
      showError(error);
      setFile(null);
      e.target.value = ""; // Clear file input
    } else {
      setValidationError("");
      setFile(selectedFile);
      showInfo("File selected: " + selectedFile.name);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    console.log(file);

    // Validate before upload
    const error = validateFile(file);
    if (error) {
      showError(error);
      return;
    }

    setUploading(true);

    // Create FormData
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload", formData, {
        timeout: 30000, // 30 second timeout for large files
      });

      // Show success toast
      showSuccess(
        res.data.message || "Upload successful! Adding locations to map...",
        {
          autoClose: 3000,
        },
      );

      // Reset form
      setFile(null);
      setValidationError("");
      document.getElementById("file-input").value = "";

      // Optional: Refresh locations on map page after delay
      setTimeout(() => {
        showInfo(`${res.data.count || 0} locations added to your map`);
      }, 1500);
    } catch (err) {
      console.error("Upload error:", err);

      let errorMessage = "Upload failed. Please try again.";

      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.message || errorMessage;

        // Handle specific error cases
        if (err.response.status === 400) {
          if (
            err.response.data?.message?.includes("ZIP") ||
            err.response.data?.message?.includes("text file")
          ) {
            errorMessage = "Invalid file: " + err.response.data.message;
          }
        } else if (err.response.status === 413) {
          errorMessage = "File too large. Maximum size is 5MB";
        }
      } else if (err.request) {
        // No response received
        errorMessage = "Network error. Please check your connection.";
      }

      showError(errorMessage, { autoClose: 4000 });
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setValidationError("");
    const fileInput = document.getElementById("file-input");
    if (fileInput) fileInput.value = "";
    showInfo("File selection cleared");
  };

  // Sample file format helper
  const downloadSampleFile = () => {
    const sampleContent = `Name, Latitude, Longitude
Suria KLCC,3.157324409,101.7121981
Zoo Negara,3.21054160,101.75920504
Petronas Twin Towers,3.1578,101.7118
Batu Caves,3.2373,101.6839
KL Tower,3.1528,101.7033`;

    const blob = new Blob([sampleContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_locations.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showInfo(
      "Sample file downloaded. Create a ZIP file containing this .txt file.",
    );
  };

  return (
    <div className="d-flex vh-100">
      <Sidebar />

      <div className="container-fluid p-4" style={{ flex: 1 }}>
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow">
              <div className="card-body">
                <h3 className="card-title text-center mb-4">
                  📤 Upload Location Data
                </h3>

                <p className="text-muted text-center mb-4">
                  Upload a ZIP file containing location data in CSV format
                </p>

                {/* File Format Instructions */}
                <div className="alert alert-info mb-4">
                  <h5 className="alert-heading">
                    <i className="bi bi-info-circle me-2"></i>
                    File Requirements
                  </h5>
                  <ul className="mb-0">
                    <li>
                      Must be a <strong>ZIP file</strong>
                    </li>
                    <li>
                      Must contain <strong>exactly one .txt file</strong>
                    </li>
                    <li>
                      Text file format: <code>Name, Latitude, Longitude</code>
                    </li>
                    <li>
                      Maximum file size: <strong>5MB</strong>
                    </li>
                  </ul>
                </div>

                {/* Upload Form */}
                <form onSubmit={handleUpload}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Select ZIP File
                    </label>
                    <input
                      id="file-input"
                      type="file"
                      className={`form-control ${validationError ? "is-invalid" : ""}`}
                      accept=".zip"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                    {validationError && (
                      <div className="invalid-feedback d-block">
                        {validationError}
                      </div>
                    )}
                    {file && !validationError && (
                      <div className="valid-feedback d-block mt-2">
                        <i className="bi bi-check-circle me-1 text-success"></i>
                        Selected: <strong>{file.name}</strong> (
                        {Math.round(file.size / 1024)} KB)
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-md-2"
                      onClick={handleReset}
                      disabled={uploading}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Clear
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={uploading || !file}
                    >
                      {uploading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-cloud-upload me-1"></i>
                          Upload File
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Sample File Section */}
                <div className="mt-5 pt-4 border-top">
                  <h5 className="mb-3">
                    <i className="bi bi-file-earmark-text me-2"></i>
                    Sample File Format
                  </h5>

                  <div className="card bg-light">
                    <div className="card-body">
                      <pre className="mb-0 small">
                        {`Name, Latitude, Longitude
Suria KLCC,3.157324409,101.7121981
Zoo Negara,3.21054160,101.75920504
Petronas Twin Towers,3.1578,101.7118`}
                      </pre>
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      type="button"
                      className="btn btn-outline-info btn-sm"
                      onClick={downloadSampleFile}
                    >
                      <i className="bi bi-download me-1"></i>
                      Download Sample File
                    </button>
                    <p className="text-muted small mt-2">
                      Download this sample, add it to a ZIP file, and upload it
                      to test.
                    </p>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="mt-4">
                  <div className="alert alert-light border">
                    <h6 className="mb-2">
                      <i className="bi bi-lightbulb me-2"></i>
                      Quick Tips
                    </h6>
                    <ul className="small mb-0">
                      <li>Use any ZIP tool (macOS: Right-click → Compress)</li>
                      <li>Ensure your .txt file uses comma separation</li>
                      <li>Coordinates should be in decimal format</li>
                      <li>After upload, locations will appear on your map</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;

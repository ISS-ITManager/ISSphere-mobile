import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonSpinner,
  IonText,
  IonBadge,
  IonIcon,
  IonCard,
  IonCardContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonRow,
  IonCol,
  IonGrid,
  IonButton,
  IonAvatar,
  IonInput,
  IonItem,
  IonList,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import {
  calendarOutline,
  callOutline,
  personCircleOutline,
  locationOutline,
  timeOutline,
  cashOutline,
  documentAttachOutline,
  cloudUploadOutline,
  closeCircleOutline,
  calendar,
  informationCircleOutline,
  person,
  documentText,
  navigateCircle,
  clipboard,
  hammer,
  time,
  checkmarkDoneOutline,
  cubeOutline,
  briefcaseOutline,
} from "ionicons/icons";
import { getWorkOrderDetails, getCategories, getAssets } from "../../api/api";
import Header from "../../components/Header";
import BadgeComponent from "../../utilities/badgecomponent";
import WorkOrderTimeline from "../../utilities/workordertimelinecomponent";

// Define the WorkOrder type
interface WorkOrder {
  id: string;
  reference_number: string;
  start_date: string;
  end_date: string;
  day: string;
  remarks: string | null;
  status_durations: {
    open: string;
    inprogress: string;
    pending: string;
  };
  assignees: Array<{
    id: string;
    first_name: string;
    last_name: string;
    mobile_number: string;
  }>;
  location: {
    group: string;
    entity: string;
    property: string;
    zone: string;
    level: string;
    room: string;
  };
  total_cost: number;
  active_status: {
    status: string;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  work_order_request: {
    work_order_description: string;
    priority: string;
    requested_by: {
      first_name: string;
      last_name: string;
    };
    accepted_by: {
      first_name: string;
      last_name: string;
    };
  };
}

const WorkOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string>("details");
  const [assetName, setAssetName] = useState("");
  const [assets, setAssets] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | undefined>("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    ""
  );
  const [selectedAsset, setSelectedAsset] = useState<string | undefined>("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [loadingAssets, setLoadingAssets] = useState<boolean>(false);

  const actions = ["New", "Transfer", "Repair", "Condemn", "Remove"];

  useEffect(() => {
    const fetchWorkOrderDetails = async () => {
      if (!id) {
        setError("Work order ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getWorkOrderDetails(id);
        setWorkOrder(data.data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred.";
        setError(`Failed to fetch work order details: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrderDetails();
  }, [id]);

  const addAsset = () => {
    if (assetName.trim()) {
      setAssets([...assets, assetName]);
      setAssetName("");
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await getCategories(); // Call the corrected API function
        console.log("Fetched Categories Response:", response); // Log the response to inspect it
        if (response && response.length > 0) {
          setCategoryOptions(response); // Set categories if valid data is returned
        } else {
          console.error("Error: Invalid or empty categories response.");
          setCategoryOptions([]); // Fallback to empty array if invalid
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategoryOptions([]); // Handle error gracefully by setting empty array
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const fetchAssets = async () => {
        setLoadingAssets(true);
        try {
          const assets = await getAssets(selectedCategory);
          console.log("Fetched Assets:", assets); // Log the fetched assets
          if (assets && Array.isArray(assets)) {
            setAssetOptions(assets); // Set the assets correctly
          } else {
            console.error("Invalid response structure for assets:", assets);
          }
        } catch (error) {
          console.error("Error fetching assets:", error);
        } finally {
          setLoadingAssets(false);
        }
      };

      fetchAssets();
    }
  }, [selectedCategory]);

  const handleAddAsset = () => {
    if (!selectedAction || !selectedCategory || !selectedAsset) {
      alert("Please fill out all fields");
      return;
    }
    console.log("Asset Added:", {
      selectedAction,
      selectedCategory,
      selectedAsset,
    });
    // Add your asset submission logic here
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
    }
  };

  const removeFile = (fileIndex: number) => {
    setUploadedFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== fileIndex)
    );
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div className="ion-text-center ion-margin-top">
            <IonSpinner name="bubbles" />
            <IonText color="medium" className="ion-margin-top">
              Loading work order details...
            </IonText>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div className="ion-text-center ion-margin-top">
            <IonText color="danger">{error}</IonText>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <Header title="Work Order Details" />
      <IonContent
        className="ion-padding"
        style={{ backgroundColor: "#f7f7f7" }}
      >
        {workOrder ? (
          <>
            {/* Header Section */}
            <IonCard
              style={{
                borderRadius: "15px",
                boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
                background: "#fff", // Add a white background for the card
                margin: "20px", // Add some margin for spacing
              }}
            >
              <IonCardContent
                className="ion-text-center"
                style={{ padding: "20px" }}
              >
                <BadgeComponent status={workOrder.active_status.status} />
                <IonText className="ion-margin-top">
                  <h2
                    style={{
                      fontSize: "24px",
                      fontWeight: "700", // Bolder font weight for emphasis
                      color: "#333", // Use a darker color for text
                      marginBottom: "10px", // Add margin for spacing between the title and content
                    }}
                  >
                    Work Order #{workOrder.reference_number}
                  </h2>
                </IonText>
              </IonCardContent>
            </IonCard>

            {/* Attachments Section */}
            <IonCard
              style={{
                borderRadius: "15px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              <IonCardContent>
                <IonText>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#000000",
                    }}
                  >
                    <IonIcon icon={documentAttachOutline} /> Attach Documents
                  </h3>
                </IonText>
                <IonItem className="ion-margin-top">
                  <IonLabel>Upload Files</IonLabel>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                    id="fileUpload"
                  />
                  <IonButton
                    slot="end"
                    onClick={() =>
                      document.getElementById("fileUpload")?.click()
                    }
                    style={{
                      backgroundColor: "#4CAF50",
                      borderRadius: "50px",
                    }}
                  >
                    <IonIcon icon={cloudUploadOutline} /> Upload
                  </IonButton>
                </IonItem>
                <IonList>
                  {uploadedFiles.map((file, index) => (
                    <IonItem key={index} style={{ padding: "10px" }}>
                      <IonLabel style={{ fontWeight: "500" }}>
                        {file.name}
                      </IonLabel>
                      <IonButton
                        slot="end"
                        color="danger"
                        onClick={() => removeFile(index)}
                        style={{
                          borderRadius: "50px",
                          padding: "5px 15px",
                        }}
                      >
                        <IonIcon icon={closeCircleOutline} />
                      </IonButton>
                    </IonItem>
                  ))}
                </IonList>
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardContent
                style={{
                  height: "500px",
                  // padding: "5px 15px",
                }}
              >
                {/* Render the WorkOrderTimeline component */}
                <WorkOrderTimeline workOrderId={id!} />
              </IonCardContent>
            </IonCard>

            {/* Segment Navigation */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <IonSegment
                value={selectedSegment}
                onIonChange={(e) => setSelectedSegment(e.detail.value!)}
                scrollable
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "94%",
                  borderBottomLeftRadius: "0px",
                  borderBottomRightRadius: "0px",
                }}
              >
                <IonSegmentButton
                  value="details"
                  style={{ flex: 1, textAlign: "center" }}
                >
                  <IonIcon
                    icon={informationCircleOutline}
                    style={{ fontSize: "20px", marginBottom: "5px" }}
                  />
                  <IonLabel>Details</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton
                  value="tasks"
                  style={{ flex: 1, textAlign: "center" }}
                >
                  <IonIcon
                    icon={checkmarkDoneOutline}
                    style={{ fontSize: "20px", marginBottom: "5px" }}
                  />
                  <IonLabel>Tasks</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton
                  value="supplies"
                  style={{ flex: 1, textAlign: "center" }}
                >
                  <IonIcon
                    icon={cubeOutline}
                    style={{ fontSize: "20px", marginBottom: "5px" }}
                  />
                  <IonLabel>Supplies</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton
                  value="assets"
                  style={{ flex: 1, textAlign: "center" }}
                >
                  <IonIcon
                    icon={briefcaseOutline}
                    style={{ fontSize: "20px", marginBottom: "5px" }}
                  />
                  <IonLabel>Assets</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </div>

            {/* Conditional Content Based on Selected Segment */}
            {selectedSegment === "details" && (
              <IonContent>
                {/* Work Order Request Details */}
                <IonCard
                  style={{
                    borderTopRightRadius: "0px",
                    borderTopLeftRadius: "0px",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                    margin: "15px",
                    padding: "20px",
                    backgroundColor: "#fff",
                  }}
                >
                  <IonCardContent>
                    <IonText>
                      <h3
                        style={{
                          fontSize: "20px",
                          fontWeight: "700",
                          color: "#333",
                          marginBottom: "15px",
                          textAlign: "center",
                        }}
                      >
                        Work Order Request Details
                      </h3>

                      {/* Reference Number */}
                      <div style={{ marginBottom: "15px" }}>
                        <IonIcon
                          icon={clipboard}
                          style={{
                            marginRight: "10px",
                            fontSize: "20px",
                            color: "#000",
                          }}
                        />
                        <strong>Reference Number:</strong>
                        <p style={{ fontSize: "16px", color: "#333" }}>
                          {workOrder.work_order_request.reference_number}
                        </p>
                      </div>

                      {/* Description */}
                      <div style={{ marginBottom: "15px" }}>
                        <IonIcon
                          icon={documentText}
                          style={{
                            marginRight: "10px",
                            fontSize: "20px",
                            color: "#000",
                          }}
                        />
                        <strong>Description:</strong>
                        <p style={{ fontSize: "16px", color: "#333" }}>
                          {workOrder.work_order_request.work_order_description}
                        </p>
                      </div>

                      {/* Date and Time Requested */}
                      <div style={{ marginBottom: "15px" }}>
                        <IonIcon
                          icon={calendar}
                          style={{
                            marginRight: "10px",
                            fontSize: "20px",
                            color: "#000",
                          }}
                        />
                        <strong>Date and Time Requested:</strong>
                        <p style={{ fontSize: "16px", color: "#333" }}>
                          {new Date(
                            workOrder.work_order_request.requested_date
                          ).toLocaleString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </IonText>
                  </IonCardContent>
                </IonCard>

                {/* Requestor and Service Details */}
                <IonCard
                  style={{
                    borderRadius: "15px",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                    margin: "15px",
                    padding: "20px",
                    backgroundColor: "#fff",
                  }}
                >
                  <IonCardContent>
                    <IonText>
                      <h3
                        style={{
                          fontSize: "20px",
                          fontWeight: "700",
                          color: "#333",
                          marginBottom: "15px",
                          textAlign: "center",
                        }}
                      >
                        Requestor and Service Details
                      </h3>

                      {/* Requested By */}
                      <div style={{ marginBottom: "15px" }}>
                        <IonIcon
                          icon={person}
                          style={{
                            marginRight: "10px",
                            fontSize: "20px",
                            color: "#000",
                          }}
                        />
                        <strong>Requested By:</strong>
                        <p style={{ fontSize: "16px", color: "#333" }}>
                          {
                            workOrder.work_order_request.requested_by.profile
                              .first_name
                          }{" "}
                          {
                            workOrder.work_order_request.requested_by.profile
                              .last_name
                          }
                        </p>
                      </div>

                      {/* Accepted By */}
                      <div style={{ marginBottom: "15px" }}>
                        <IonIcon
                          icon={person}
                          style={{
                            marginRight: "10px",
                            fontSize: "20px",
                            color: "#000",
                          }}
                        />
                        <strong>Accepted By:</strong>
                        <p style={{ fontSize: "16px", color: "#333" }}>
                          {
                            workOrder.work_order_request.accepted_by.profile
                              .first_name
                          }{" "}
                          {
                            workOrder.work_order_request.accepted_by.profile
                              .last_name
                          }
                        </p>
                      </div>

                      {/* Location */}
                      <div style={{ marginBottom: "15px" }}>
                        <IonIcon
                          icon={locationOutline}
                          style={{
                            marginRight: "10px",
                            fontSize: "22px",
                            color: "#000",
                          }}
                        />
                        <strong>Location:</strong>
                        <p style={{ fontSize: "16px", color: "#333" }}>
                          {workOrder.location.property} -{" "}
                          {workOrder.location.zone} - {workOrder.location.level}{" "}
                          - {workOrder.location.room}
                        </p>
                      </div>
                    </IonText>
                  </IonCardContent>
                </IonCard>

                {/* Work Order Status */}
                <IonCard
                  style={{
                    borderRadius: "15px",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                    margin: "15px",
                    padding: "20px",
                    backgroundColor: "#fff",
                  }}
                >
                  <IonCardContent>
                    <IonText>
                      <h3
                        style={{
                          fontSize: "20px",
                          fontWeight: "700",
                          color: "#333",
                          marginBottom: "15px",
                          textAlign: "center",
                        }}
                      >
                        Work Order Status
                      </h3>

                      <div style={{ marginBottom: "15px" }}>
                        <IonIcon
                          icon={time}
                          style={{
                            marginRight: "10px",
                            fontSize: "20px",
                            color: "#000",
                          }}
                        />
                        <strong>Status:</strong>
                        <p style={{ fontSize: "16px", color: "#333" }}>
                          {workOrder.active_status.status}
                        </p>
                      </div>
                    </IonText>
                  </IonCardContent>
                </IonCard>
              </IonContent>
            )}

            {selectedSegment === "tasks" && (
              <IonCard
                style={{
                  borderRadius: "15px",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                }}
              >
                <IonCardContent>
                  <IonText>
                    <h3 style={{ fontSize: "18px", fontWeight: "600" }}>
                      Tasks Section
                    </h3>
                    <p>Task details will be displayed here.</p>
                  </IonText>
                </IonCardContent>
              </IonCard>
            )}

            {selectedSegment === "supplies" && (
              <IonCard
                style={{
                  borderRadius: "15px",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                }}
              >
                <IonCardContent>
                  <IonText>
                    <h3 style={{ fontSize: "18px", fontWeight: "600" }}>
                      Supplies Section
                    </h3>
                    <p>Supplies details will be displayed here.</p>
                  </IonText>
                </IonCardContent>
              </IonCard>
            )}

            {selectedSegment === "assets" && (
              <IonCard>
                <IonCardContent>
                  <IonText>
                    <h3>Add Asset</h3>
                  </IonText>
                  <IonItem>
                    <IonLabel>Actions</IonLabel>
                    <IonSelect
                      value={selectedAction}
                      onIonChange={(e) => setSelectedAction(e.detail.value)}
                    >
                      {actions.map((action, index) => (
                        <IonSelectOption key={index} value={action}>
                          {action}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>

                  <IonItem>
                    <IonLabel>Category</IonLabel>
                    <IonSelect
                      value={selectedCategory}
                      onIonChange={(e) => setSelectedCategory(e.detail.value)}
                      placeholder="Select Category"
                    >
                      {loadingCategories ? (
                        <IonSelectOption value="" disabled>
                          <IonSpinner />
                        </IonSelectOption>
                      ) : (
                        categoryOptions.map((category) => (
                          <IonSelectOption
                            key={category.id}
                            value={category.id}
                          >
                            {category.asset_category}{" "}
                            {/* Make sure to use the correct property */}
                          </IonSelectOption>
                        ))
                      )}
                    </IonSelect>
                  </IonItem>

                  <IonItem>
                    <IonLabel>Asset</IonLabel>
                    <IonSelect
                      value={selectedAsset}
                      onIonChange={(e) => setSelectedAsset(e.detail.value)}
                      placeholder="Select Asset"
                      disabled={!selectedCategory}
                    >
                      {loadingAssets ? (
                        <IonSelectOption value="" disabled>
                          <IonSpinner />
                        </IonSelectOption>
                      ) : (
                        assetOptions.map((asset) => (
                          <IonSelectOption key={asset.id} value={asset.id}>
                            {asset.asset}
                          </IonSelectOption>
                        ))
                      )}
                    </IonSelect>
                  </IonItem>

                  <IonButton expand="block" onClick={handleAddAsset}>
                    Apply Filter
                  </IonButton>
                </IonCardContent>
              </IonCard>
            )}
          </>
        ) : (
          <IonText color="medium">
            Work order details are not available.
          </IonText>
        )}
      </IonContent>
    </IonPage>
  );
};

export default WorkOrderDetails;

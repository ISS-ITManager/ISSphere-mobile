import React, { useState, useRef, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  IonButton,
  IonModal,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonPage,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonTab,
  IonSearchbar,
  IonList,
  IonItem,
  IonAvatar,
  IonImg,
  IonIcon,
  IonText,
  IonCard,
  IonCardContent,
  IonTextarea,
  IonGrid,
  IonRow,
  IonCol,
  IonAccordionGroup,
  IonAccordion,
  IonBadge,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButtons,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonCardHeader,
  IonCardTitle,
  IonAlert,
  IonChip,
  useIonAlert,
  IonActionSheet,
  IonToast,
} from "@ionic/react";
import {
  addOutline,
  saveOutline,
  listOutline,
  closeOutline,
  listCircle,
  documentAttachOutline,
  cloudUploadOutline,
  informationCircleOutline,
  timeOutline,
  personCircleOutline,
  cubeOutline,
  fileTrayFullOutline,
  statsChart,
  trashOutline,
  cashOutline,
  receiptOutline,
  cameraOutline,
  imageOutline,
} from "ionicons/icons";
import "./workorder.css";
import Header from "../../components/Header";
import ModalComponent from "../../components/Modal";
import Loading from "../../utilities/loadingpage";

import {
  getWorkOrderDetails,
  getCategories,
  getAssets,
  workOrderAssetsCreateApi,
  getWorkOrderTasks,
  workOrderActivityLogApi,
  assigneeApi,
  workOrderTaskApi,
  supplierApi,
  supplyApi,
  supplyCategoryApi,
  workOrderSupplyApi,
  workOrderApi,
  getGroups,
  getEntitiesByGroupId,
  workOrderExpenseApi,
  getPropertiesByEntityId,
  getZonesByPropertyId,
  getLevelByZoneId,
  getRoomByLevelId,
  getWorkOrderAssets,
  deleteWorkOrderAsset,
  uploadWorkOrderDocuments,
} from "../../api/api";
import BadgeComponent from "../../utilities/badgecomponent";
import Timeline from "../../utilities/workordertimelinecomponent";
import Details from "./workorder-components/details";
import Assets from "./workorder-components/assets";
import { formatDate, presentToast } from "../../utilities/globalfns";
import WorkOrderSupplies from "./workorder-components/supplies";
import ModalComponent1 from "../../components/ModalComponent1";
import BadgePriority from "../../utilities/badgePriority";
import BadgeStatus from "../../utilities/BadgeStatus";
import WorkOrderExpenses from "./workorder-components/expense";
import { hasPermission } from "../../utilities/globalfns";
import MasterComponent from "../../components/MasterComponent";
import DeletePopup from "../../utilities/DeletePopup";
import useErrorAlert from "../../utilities/ErrorAlert";

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

const WorkOrder: React.FC = () => {
  const history = useHistory();
  const [selectedTab, setSelectedTab] = useState("details");
  const modal = useRef<HTMLIonModalElement>(null);
  const { id } = useParams<{ id: string }>();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    ""
  );
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string | undefined>("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState<boolean>(false);
  const [pageTitle, setPageTitle] = useState("Work Order");

  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const [apiSuccess, setApiSuccess] = useState<boolean>(false);
  const [apiData, setApiData] = useState<any>(null);
  const deletePopupRef = useRef<DeletePopupRef>(null);

  const [tasks, setTasks] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<number | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);

  const [entities, setEntities] = useState<any[]>([]);
  const [properties, setProperties] = useState([]);
  const [zones, setZones] = useState([]);
  const [levels, setLevels] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [loadingTasks, setLoadingTasks] = useState<boolean>(false);
  const [assignees, setAssignees] = useState([]);
  const [addTask, setAddTask] = useState(false);
  const [formTask, setFormTask] = useState({
    work_order_id: id,
    assignee_id: "",
    title: "",
    description: "",
    priority: "",
    status: "new",
    start_date: new Date().toLocaleDateString(),
    end_date: "N/A",
  });
  const [activityLogs, setActivityLogs] = useState([]);
  // const [returnMsg, setReturnMsg] = useState<string>("");
  const [supplierList, setSupplierList] = useState([]);
  const [supplyCategory, setSupplyCategory] = useState([]);
  const [supplyList, setSupplyList] = useState([]);
  const [workOrderSupplyList, setWorkOrderSupplyList] = useState([]);
  const [openSupply, setOpenSupply] = useState(false);
  const [updateWorkOrder, setUpdateWorkOrder] = useState(false);

  const [workOrderStatus, setWorkOrderStatus] = useState("");
  const [workOrderRemarks, setWorkOrderRemarks] = useState("");
  const [timelineKey, setTimelineKey] = useState(0);
  const [workOrderExpenseList, setWorkOrderExpenseList] = useState([]);
  const [openExpense, setOpenExpense] = useState(false);
  const [presentAlert] = useIonAlert();
  const showError = useErrorAlert();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleApplyFilter = async () => {
    try {
      const response = await workOrderAssetsCreateApi.list({
        work_order: id,
        action: selectedAction,
        asset: selectedAsset,
        asset_category: selectedCategory,
      });

      console.log("API Response:", response);

      if (response.success) {
        setApiSuccess(true);
        setApiData(response.data);
      } else {
        setApiSuccess(false);
        setApiData([]);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      setApiSuccess(false);
      setApiData([]);
    }
  };

  const tabs = [
    { name: "details", icon: informationCircleOutline },
    { name: "assets", icon: listOutline },
    { name: "task", icon: fileTrayFullOutline },
    { name: "supplies", icon: cubeOutline },
    { name: "expenses", icon: receiptOutline },
    { name: "activity", icon: timeOutline },
  ];

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    modal.current?.present();

    setTimelineKey((prevKey) => prevKey + 1);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormTask((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleUpdateWorkOrder = async () => {
    setUpdateWorkOrder(true);
  };
  const handleSaveWorkOrder = async (workOrder) => {
    // console.log("handleSaveWorkOrder: "  +  JSON.stringify(workOrder));
    if (workOrder && workOrderStatus) {
      try {
        let data = {
          work_order: workOrder.id,
          status: workOrderStatus,
          remarks: workOrderRemarks,
        };
        localStorage.removeItem("workOrderId");
        localStorage.removeItem("workOrderStatuses");
        const req = await workOrderApi.workOrderStatus(data);
        console.log("handleSaveWorkOrder req: " + JSON.stringify(req.data));
        setTimelineKey((prevKey) => prevKey + 1); //this is to fetch the timeline after updating status
      } catch (error) {
        console.log(
          "handleSaveWorkOrder error: " + JSON.stringify(error.message)
        );
        showError(error.response?.data?.message || "Something went wrong");
      }
      await fetchWorkOrderDetails();
    }
    setUpdateWorkOrder(false);
  };

  const getContentModalUpdateWO = (workOrder) => {
    // console.log("WORKOrder: " + JSON.stringify(workOrder));

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        setUploadedFiles([...uploadedFiles, ...Array.from(event.target.files)]);
      }
    };

    const handleCameraCapture = async (source: CameraSource) => {
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: source,
        });

        const response = await fetch(image.webPath!);
        const blob = await response.blob();
        const file = new File([blob], "captured_image.jpg", {
          type: "image/jpeg",
        });

        setUploadedFiles([...uploadedFiles, file]);
        setSelectedFile(file);
      } catch (error) {
        console.error("Camera error:", error);
      }
    };

    const uploadFile = async () => {
      if (uploadedFiles.length === 0) {
        setToastMessage("Please select a file to upload.");
        setShowToast(true);
        return;
      }

      try {
        const response = await uploadWorkOrderDocuments(
          uploadedFiles,
          id,
          workOrder?.work_order_request?.work_order_type?.id
        );
        setToastMessage("File uploaded successfully!");
        setUploadedFiles([]);
      } catch (error) {
        setToastMessage(error.message);
      } finally {
        setShowToast(true);
      }
    };

    const removeFile = (index: number) => {
      const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
      setUploadedFiles(updatedFiles);
    };

    return (
      <>
        {workOrder && (
          <IonList className="ion-padding">
            <IonLabel>
              {" "}
              Current Status: {workOrder?.active_status?.status}
            </IonLabel>
            <IonItem>
              <IonLabel>
                <b>Status</b>
              </IonLabel>
              <IonSelect
                value={workOrderStatus}
                label="Status"
                onIonChange={(e) => setWorkOrderStatus(e.target.value)}
              >
                {workOrder?.active_status?.status === "open" && (
                  <IonSelectOption value="in-progress">
                    In-Progress
                  </IonSelectOption>
                )}
                {workOrder?.active_status?.status === "pending" && (
                  <>
                    <IonSelectOption value="in-progress">
                      In-Progress
                    </IonSelectOption>
                    <IonSelectOption value="completed">
                      Completed
                    </IonSelectOption>
                    <IonSelectOption value="cancelled">
                      Cancelled
                    </IonSelectOption>
                  </>
                )}
                {workOrder?.active_status?.status === "in-progress" && (
                  <>
                    <IonSelectOption value="pending">Pending</IonSelectOption>
                    <IonSelectOption value="completed">
                      Completed
                    </IonSelectOption>
                    <IonSelectOption value="cancelled">
                      Cancelled
                    </IonSelectOption>
                  </>
                )}
                {workOrder?.active_status?.status === "completed" && (
                  <>
                    <IonSelectOption value="completed">
                      Completed
                    </IonSelectOption>
                    <IonSelectOption value="closed">Closed</IonSelectOption>
                  </>
                )}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel>
                <b>Remarks</b>
              </IonLabel>
              <IonTextarea
                className="ion-text-end"
                onIonInput={(e) => setWorkOrderRemarks(e.target.value)}
                rows={4}
                placeholder="Type your remarks here"
                value={workOrderRemarks}
              />
            </IonItem>

            {/* Attachments Section */}
            {workOrderStatus === "completed" && (
              <div className="attachments-section">
                <div className="section-header">
                  <IonItem>
                    <IonIcon
                      icon={documentAttachOutline}
                      className="section-icon"
                    />
                    <label>Attach Documents</label>
                  </IonItem>
                </div>

                <IonItem lines="none" className="upload-container">
                  <IonLabel>Upload Files</IonLabel>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                    id="fileUpload"
                  />
                  <IonButton
                    slot="end"
                    onClick={() => setShowActionSheet(true)}
                    className="upload-btn"
                  >
                    <IonIcon icon={cloudUploadOutline} /> Upload
                  </IonButton>
                </IonItem>

                <IonList className="file-list">
                  {uploadedFiles.map((file, index) => (
                    <IonItem key={index} className="file-item">
                      <IonLabel>{file.name}</IonLabel>
                      <IonButton
                        slot="end"
                        color="danger"
                        onClick={() => removeFile(index)}
                        className="remove-file-btn"
                      >
                        <IonIcon icon={closeOutline} />
                      </IonButton>
                    </IonItem>
                  ))}
                </IonList>

                <IonButton expand="block" color="primary" onClick={uploadFile}>
                  Upload Selected Files
                </IonButton>

                <IonActionSheet
                  isOpen={showActionSheet}
                  onDidDismiss={() => setShowActionSheet(false)}
                  buttons={[
                    {
                      text: "Take a Photo",
                      icon: cameraOutline,
                      handler: () => handleCameraCapture(CameraSource.Camera),
                    },
                    {
                      text: "Choose from Gallery",
                      icon: imageOutline,
                      handler: () => handleCameraCapture(CameraSource.Photos),
                    },
                    {
                      text: "Select File",
                      icon: cloudUploadOutline,
                      handler: () =>
                        document.getElementById("fileUpload")?.click(),
                    },
                    {
                      text: "Cancel",
                      role: "cancel",
                    },
                  ]}
                />

                <IonToast
                  isOpen={showToast}
                  message={toastMessage}
                  duration={3000}
                  onDidDismiss={() => setShowToast(false)}
                />
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "1rem",
              }}
            >
              <IonButton
                fill="outline"
                onClick={() => setUpdateWorkOrder(false)}
              >
                Cancel
              </IonButton>
              <IonButton
                disabled={
                  !hasPermission("work-order-status.edit") ||
                  workOrder?.active_status?.status === "closed"
                }
                onClick={() => handleSaveWorkOrder(workOrder)}
              >
                Continue
              </IonButton>
            </div>
          </IonList>
        )}
      </>
    );
  };

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
      // console.log("getWorkOrderDetails: " + JSON.stringify(data.data));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to fetch work order details: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  //fetch work order details
  useEffect(() => {
    fetchWorkOrderDetails();
  }, [id]);

  const addAsset = () => {
    if (assetName.trim()) {
      setAssets([...assets, assetName]);
      setAssetName("");
    }
  };

  useEffect(() => {
    // Fetch work order assets on component mount
    const fetchAssetsLists = async () => {
      try {
        const response = await getWorkOrderAssets(id); // Pass workOrderId here
        setAssets(response.data); // Update state with the fetched assets
      } catch (error) {
        console.error("Error fetching assets:", error);
      } finally {
        setLoading(false); // Set loading to false when done
      }
    };

    fetchAssetsLists();
  }, [id]);

  const refreshAssets = async () => {
    setLoading(true);
    try {
      const response = await getWorkOrderAssets(id); // Assuming workOrderId is passed correctly
      setAssets(response.data); // Update state with the fetched assets
      fetchWorkOrderDetails();
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAssets(); // Initial fetch when the component mounts
  }, []);

  const fetchTasks = async () => {
    if (!id) return;

    setLoadingTasks(true);
    try {
      const response = await getWorkOrderTasks(id);
      if (response.success) {
        await setTasks(response.data);
        // console.log("Tasks: " + JSON.stringify(response.data));
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [id]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await getCategories(); // Call the corrected API function
        // console.log("Fetched Categories Response:", response); // Log the response to inspect it
        if (response && response.length > 0) {
          setCategoryOptions(response);
        } else {
          console.error("Error: Invalid or empty categories response.");
          setCategoryOptions([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategoryOptions([]);
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

          // console.log("Fetched Assets:", assets); // Log the fetched assets

          if (assets && Array.isArray(assets)) {
            setAssetOptions(assets);
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

  const fetchSupplyList = async () => {
    try {
      const req = await workOrderSupplyApi.list(id);
      console.log("supplyList: " + JSON.stringify(req.data.data));
      setWorkOrderSupplyList(req.data.data);
    } catch (error) {
      console.log("fetchSupplyList error: " + error.message);
    }
  };

  const fetchExpenseList = async () => {
    try {
      const req = await workOrderExpenseApi.list(id);
      setWorkOrderExpenseList(req.data.data);
    } catch (error) {
      console.log("fetchExpenseList error: " + error.message);
    }
  };

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const req = await supplierApi.list();
        // console.log("supplierList: " + JSON.stringify(req.data.data));

        setSupplierList(req.data.data);
      } catch (error) {}
    };

    const fetchSupplyCategory = async () => {
      try {
        const req = await supplyCategoryApi.list();
        // console.log("supplyCat: " + JSON.stringify(req.data.data));

        setSupplyCategory(req.data.data);
      } catch (error) {}
    };

    const fetchSupplies = async () => {
      try {
        const req = await supplyApi.list();
        // console.log("supplies: " + JSON.stringify(req.data.data));

        setSupplyList(req.data.data);
      } catch (error) {}
    };
    fetchSupplyList();
    fetchSuppliers();
    fetchSupplyCategory();
    fetchSupplies();

    fetchExpenseList();
  }, []);

  const fetchActivityLogs = async () => {
    if (id) {
      try {
        setLoading(true);
        const data = await workOrderActivityLogApi.list(id);
        // console.log("activityLogs: " + JSON.stringify(data.data.data));

        setActivityLogs(data.data.data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred.";
        setError(`Failed to fetch work order details: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };
  //fetch activityLogs
  useEffect(() => {
    fetchActivityLogs();
  }, [id]);

  //fetch all assignees
  useEffect(() => {
    const fetchAssignees = async () => {
      try {
        setLoading(true);
        const data = await assigneeApi.list();
        setAssignees(data.data.data);
        // console.log("assignees: " + JSON.stringify(data.data.data));
      } catch (error) {
        console.log(error);
      }
    };
    fetchAssignees();
  }, []);

  // Fetch groups once on mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await getGroups();
        setGroups(data);
      } catch (err) {
        setError("Failed to fetch groups");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Fetch entities when selectedGroup changes
  useEffect(() => {
    if (!selectedGroup) return;

    const fetchEntities = async () => {
      try {
        const data = await getEntitiesByGroupId(selectedGroup);
        setEntities(data);
      } catch (err) {
        setError("Failed to fetch entities");
      }
    };

    fetchEntities();
  }, [selectedGroup]);

  // Fetch properties when selectedEntity changes
  useEffect(() => {
    if (!selectedEntity) return;

    const fetchProperties = async () => {
      try {
        const data = await getPropertiesByEntityId(selectedEntity);
        if (Array.isArray(data)) {
          setProperties(data);
        } else {
          setError("Unexpected data format from API");
        }
      } catch (err) {
        setError("Failed to fetch properties");
      }
    };

    fetchProperties();
  }, [selectedEntity]);

  // Fetch zones when selectedProperty changes
  useEffect(() => {
    if (!selectedProperty) return;

    const fetchZones = async () => {
      try {
        const data = await getZonesByPropertyId(selectedProperty);
        if (Array.isArray(data)) {
          setZones(data);
        } else {
          setError("Unexpected data format from API");
        }
      } catch (err) {
        setError("Failed to fetch zones");
      }
    };

    fetchZones();
  }, [selectedProperty]);

  // Fetch levels when selectedZone changes
  useEffect(() => {
    if (!selectedZone) return;

    const fetchLevels = async () => {
      try {
        const data = await getLevelByZoneId(selectedZone);
        if (Array.isArray(data)) {
          setLevels(data);
        } else {
          setError("Unexpected data format from API");
        }
      } catch (err) {
        setError("Failed to fetch zones");
      }
    };

    fetchLevels();
  }, [selectedZone]);

  // Fetch rooms when selectedRoom changes
  useEffect(() => {
    if (!selectedLevel) return;

    console.log("Fetching rooms for Level:", selectedLevel); // Debugging log

    const fetchRooms = async () => {
      try {
        const data = await getRoomByLevelId(selectedLevel);
        console.log("Fetched rooms:", data); // Debugging log
        if (Array.isArray(data) && data.length > 0) {
          setRooms(data);
        } else {
          setRooms([]); // Ensure state is updated even if empty
          setError("No rooms available for this level");
        }
      } catch (err) {
        setRooms([]);
        setError("Failed to fetch rooms");
      }
    };

    fetchRooms();
  }, [selectedLevel]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
    }
  };

  const getModalContent = () => {
    switch (selectedTab) {
      case "details":
        setPageTitle("Work Order Details");
        return <Details workOrder={workOrder} />;
      case "assets":
        setPageTitle("Work Order Assets");
        return (
          <Assets
            workOrderId={id}
            assets={assets}
            onSuccess={refreshAssets}
            selectedAction={selectedAction}
            selectedCategory={selectedCategory}
            selectedAsset={selectedAsset}
            setSelectedAction={setSelectedAction}
            setSelectedCategory={setSelectedCategory}
            setSelectedAsset={setSelectedAsset}
            loadingCategories={loadingCategories}
            loadingAssets={loadingAssets}
            categoryOptions={categoryOptions}
            assetOptions={assetOptions}
            groups={groups}
            setSelectedGroup={setSelectedGroup}
            selectedGroup={selectedGroup}
            entities={entities}
            setEntities={setEntities}
            selectedEntity={selectedEntity}
            setSelectedEntity={setSelectedEntity}
            properties={properties}
            setProperties={setProperties}
            selectedProperty={selectedProperty}
            setSelectedProperty={setSelectedProperty}
            zones={zones}
            setZones={setZones}
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
            levels={levels}
            setLevels={setLevels}
            selectedLevel={selectedLevel}
            setSelectedLevel={setSelectedLevel}
            rooms={rooms}
            setRooms={setRooms}
            selectedRoom={selectedRoom}
            setSelectedRoom={setSelectedRoom}
            onApplyFilter={handleApplyFilter}
            apiSuccess={apiSuccess}
            apiData={apiData}
          />
        );

      case "task":
        setPageTitle("Work Order Task");
        handleUpdateRecords();
        return (
          <>
            <IonItem>
              <IonLabel>
                <h2>Task List</h2>
              </IonLabel>
              <IonButton
                onClick={() => setAddTask(true)}
                size="default"
                slot="end"
                disabled={!hasPermission("work-order-task.create")}
              >
                <IonIcon icon={addOutline} slot="start" />
                Add
              </IonButton>
            </IonItem>

            <div style={{ maxHeight: "65%", overflowY: "auto" }}>
              {tasks &&
                tasks.map((task, index) => (
                  <IonCard
                    key={index}
                    className="bounce-in-right task-card"
                    color="light"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <IonCardHeader>
                      <IonLabel className="work-order-header">
                        <h2>
                          <b>{task.title} </b>
                        </h2>
                        <BadgeComponent status={task.status} />
                      </IonLabel>
                    </IonCardHeader>
                    <IonList onClick={() => handleViewWOTasks(task)}>
                      <IonItem>
                        <IonLabel>
                          <b>Description: </b>
                        </IonLabel>
                        <IonText>{task.description}</IonText>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <b>Priority: </b>
                        </IonLabel>
                        <BadgePriority priority={task.priority} />
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <b>Start Date: </b>
                        </IonLabel>
                        <IonText>{formatDate(task.start_date)}</IonText>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <b>Completed Date: </b>
                        </IonLabel>
                        <IonText>
                          {task.completed_date === null
                            ? "N/A"
                            : formatDate(task.completed_date)}
                        </IonText>
                      </IonItem>
                    </IonList>
                  </IonCard>
                ))}

              {tasks?.length === 0 && (
                <IonLabel>
                  <center>
                    <i>No records found</i>
                  </center>
                </IonLabel>
              )}

              {addTask && (
                <IonModal
                  isOpen={addTask}
                  onDidDismiss={() => setAddTask(false)}
                >
                  <IonHeader>
                    <IonToolbar>
                      <IonTitle>Add Task</IonTitle>
                      <IonButtons slot="end">
                        <IonButton onClick={() => setAddTask(false)}>
                          <IonIcon icon={closeOutline} />
                        </IonButton>
                      </IonButtons>
                    </IonToolbar>
                  </IonHeader>
                  <IonContent className="ion-padding">
                    <IonList>
                      <IonItem>
                        <IonLabel position="stacked">Assignee</IonLabel>
                        <IonSelect
                          name="assignee_id"
                          value={formTask.assignee_id}
                          onIonChange={(e) => handleInputChange(e)}
                          placeholder="Select assginee"
                        >
                          {assignees.map((person, index) => (
                            <IonSelectOption value={person.id} key={index}>
                              {person.first_name} {person.last_name}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonItem>
                      <IonItem>
                        <IonLabel position="stacked">Title</IonLabel>
                        <IonInput
                          name="title"
                          value={formTask.title}
                          onIonInput={(e) => handleInputChange(e)}
                          placeholder="Enter title"
                        />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="stacked">Description</IonLabel>
                        <IonTextarea
                          name="description"
                          value={formTask.description}
                          onIonInput={(e) => handleInputChange(e)}
                          placeholder="Enter description"
                          autoGrow
                        />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="stacked">Priority</IonLabel>
                        <IonSelect
                          name="priority"
                          value={formTask.priority}
                          onIonChange={(e) => handleInputChange(e)}
                          placeholder="Select priority"
                        >
                          <IonSelectOption value="low">Low</IonSelectOption>
                          <IonSelectOption value="medium">
                            Medium
                          </IonSelectOption>
                          <IonSelectOption value="high">High</IonSelectOption>
                        </IonSelect>
                      </IonItem>
                    </IonList>
                    <IonButton expand="block" onClick={handleSaveTask}>
                      Save <IonIcon slot="start" icon={saveOutline} />
                    </IonButton>
                  </IonContent>
                </IonModal>
              )}
            </div>
          </>
        );

      case "supplies":
        setPageTitle("Work Order Supplies");

        return (
          <>
            <IonItem>
              <IonLabel>
                <h2>Supply List</h2>
              </IonLabel>
              <IonButton
                onClick={() => setOpenSupply(true)}
                size="default"
                slot="end"
                disabled={!hasPermission("work-order-supply.create")}
              >
                <IonIcon icon={addOutline} slot="start" />
                Add
              </IonButton>
            </IonItem>
            <div style={{ maxHeight: "65%", overflowY: "auto" }}>
              {renderSupplies()}

              {openSupply && (
                <ModalComponent1
                  title={"Add Supply"}
                  isOpen={openSupply}
                  onClose={() => setOpenSupply(false)}
                  getContentModal={() => (
                    <WorkOrderSupplies
                      workOrder={id}
                      supplierList={supplierList}
                      categoryList={supplyCategory}
                      supplyList={supplyList}
                      closeModal={() => setOpenSupply(false)}
                      onSave={handleSaveSupply}
                    />
                  )}
                />
              )}
            </div>
          </>
        );

      case "expenses":
        setPageTitle("Other Expense");
        return (
          <>
            <IonItem>
              <IonLabel>
                <h2>Other Expenses</h2>
              </IonLabel>
              <IonButton
                disabled={!hasPermission("work-order-expense.create")}
                onClick={() => setOpenExpense(true)}
                size="default"
                slot="end"
              >
                <IonIcon icon={addOutline} slot="start" />
                Add
              </IonButton>
            </IonItem>

            <div style={{ maxHeight: "65%", overflowY: "auto" }}>
              {renderExpenses()}
              {openExpense && (
                <ModalComponent1
                  title={"Work Order Expenses"}
                  isOpen={openExpense}
                  onClose={() => setOpenExpense(false)}
                  getContentModal={() => (
                    <WorkOrderExpenses
                      workOrder={id}
                      closeModal={() => setOpenExpense(false)}
                      onSave={handleSaveExpense}
                    />
                  )}
                />
              )}
            </div>
          </>
        );

      case "activity":
        setPageTitle("Activity Logs");
        return (
          <IonContent style={{ maxHeight: "70%", overflowY: "auto" }}>
            <div>
              {activityLogs &&
                activityLogs.map((item, index) => (
                  <IonCard key={index} className="ion-padding task-card">
                    <IonItem>
                      <IonLabel>{formatDate(item.created_at)}</IonLabel>
                    </IonItem>
                    <IonItem>
                      <IonText>{item.activity}</IonText>
                    </IonItem>
                    <IonItem>
                      <IonIcon icon={personCircleOutline} />{" "}
                      <IonLabel>
                        {item.first_name} {item.middle_name} {item.last_name}
                      </IonLabel>
                    </IonItem>
                  </IonCard>
                ))}
            </div>
          </IonContent>
        );

      default:
        return null;
    }
  };

  const getModalContentAddTask = ({}) => {
    return (
      <IonContent className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="stacked">Assignee</IonLabel>
            <IonSelect
              name="assignee_id"
              value={formTask.assignee_id}
              onIonChange={(e) => handleInputChange(e)}
              placeholder="Select assginee"
            >
              {assignees.map((person, index) => (
                <IonSelectOption value={person.id} key={index}>
                  {person.first_name} {person.last_name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Title</IonLabel>
            <IonInput
              name="title"
              value={formTask.title}
              onIonInput={(e) => handleInputChange(e)}
              placeholder="Enter title"
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Description</IonLabel>
            <IonTextarea
              name="description"
              value={formTask.description}
              onIonInput={(e) => handleInputChange(e)}
              placeholder="Enter description"
              autoGrow
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Priority</IonLabel>
            <IonSelect
              name="priority"
              value={formTask.priority}
              onIonChange={(e) => handleInputChange(e)}
              placeholder="Select priority"
            >
              <IonSelectOption value="low">Low</IonSelectOption>
              <IonSelectOption value="medium">Medium</IonSelectOption>
              <IonSelectOption value="high">High</IonSelectOption>
            </IonSelect>
          </IonItem>
        </IonList>
        <IonButton expand="block" onClick={handleSaveTask}>
          Save <IonIcon slot="start" icon={saveOutline} />
        </IonButton>
      </IonContent>
    );
  };

  const renderTasks = () => {
    const completedTasks = tasks.filter((task) => task.status === "completed");
    // console.log("completed tasks: " + JSON.stringify(completedTasks));

    return (
      <div className="timeline-container">
        {completedTasks?.length > 0 && (
          <>
            <h2 className="section-title">Completed Tasks</h2>
            {completedTasks.map((task, index) => (
              <div key={task.id} className="task-container">
                {/* Vertical Timeline Line */}
                <div className="timeline-indicator">
                  <div className="timeline-line"></div> {/* Continuous line */}
                  <div className="circle"></div> {/* Circle for each task */}
                </div>

                {/* Task Card */}
                <IonCard
                  className="task-card bounce-in-right"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  disabled={!hasPermission("work-order-task.view")}
                  onClick={() => handleViewWOTasks(task)}
                >
                  <IonCardHeader>
                    <IonLabel className="work-order-header">
                      <b>{task.title} </b>
                      {/* <span className="task-badge">
                        {task.status.toUpperCase() || "Unknown"}
                      </span> */}
                      <BadgeStatus status={task.status} />
                    </IonLabel>
                  </IonCardHeader>
                  <IonItem>
                    <IonLabel>
                      <b>Description:</b>
                    </IonLabel>
                    {task.description}
                  </IonItem>
                  <IonItem>
                    <IonLabel>
                      <b>Priority:</b>
                    </IonLabel>
                    <BadgePriority priority={task.priority} />
                  </IonItem>
                  <IonItem>
                    <IonLabel>
                      <b>Assigned to: </b>
                    </IonLabel>
                    <IonText>
                      {task?.assignee?.user?.profile?.first_name}{" "}
                      {task?.assignee?.user?.profile?.middle_name}{" "}
                      {task?.assignee?.user?.profile?.last_name}
                    </IonText>
                  </IonItem>
                  <IonItem>
                    <IonLabel>
                      <b>Completed date: </b>
                    </IonLabel>
                    <IonText className="ion-text-end">
                      {formatDate(task.completed_date)}
                    </IonText>
                  </IonItem>
                </IonCard>
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  const renderSupplies = () => {
    return (
      <div>
        {workOrderSupplyList && workOrderSupplyList?.length > 0 ? (
          workOrderSupplyList?.map((stock, index) => (
            <IonCard
              key={index}
              className="bounce-in-right task-card"
              color="light"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <IonCardHeader>
                <IonButton
                  className="task-card-delete-button"
                  onClick={() =>
                    presentAlert({
                      header: "Delete Supply",
                      message: `Are you sure you want to delete "${stock.supply}" from this work order?`,
                      buttons: [
                        {
                          text: "Cancel",
                          role: "cancel",
                        },
                        {
                          text: "OK",
                          role: "confirm",
                          handler: () => handleDeleteSupply(stock),
                        },
                      ],
                    })
                  }
                  color="danger"
                  disabled={!hasPermission("work-order-supply.delete")}
                >
                  <IonIcon icon={trashOutline} />
                </IonButton>
              </IonCardHeader>
              <IonList>
                <IonItem>
                  <IonLabel>
                    <b>Supply:</b>
                  </IonLabel>
                  <IonText>{stock.supply}</IonText>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <b>Supply Category:</b>
                  </IonLabel>
                  <IonText>{stock.supply_category}</IonText>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <b>Cost:</b>
                  </IonLabel>
                  <IonText>QAR {stock.cost}</IonText>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <b>Quantity:</b>
                  </IonLabel>
                  <IonText>
                    {" "}
                    {stock.quantity} {stock.unit_of_measure}
                  </IonText>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <b>Batch Number:</b>
                  </IonLabel>
                  <IonText> {stock.batch_number}</IonText>
                </IonItem>
              </IonList>
            </IonCard>
          ))
        ) : (
          <IonLabel>
            <center>
              <i>No records found</i>
            </center>
          </IonLabel>
        )}
      </div>
    );
  };

  const renderExpenses = () => {
    return (
      <div>
        {workOrderExpenseList && workOrderExpenseList?.length > 0 ? (
          workOrderExpenseList?.map((exp, index) => (
            <IonCard
              key={index}
              className="bounce-in-right task-card"
              color="light"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <IonCardHeader>
                <IonButton
                  className="task-card-delete-button"
                  onClick={() =>
                    presentAlert({
                      header: "Delete Expense",
                      message: `Are you sure you want to delete "${exp.remarks}" expense from this work order?`,
                      buttons: [
                        {
                          text: "Cancel",
                          role: "cancel",
                        },
                        {
                          text: "OK",
                          role: "confirm",
                          handler: () => handleDeleteExpense(exp),
                        },
                      ],
                    })
                  }
                  color="danger"
                  disabled={!hasPermission("work-order-expense.delete")}
                >
                  <IonIcon icon={trashOutline} />
                </IonButton>
              </IonCardHeader>
              <IonList>
                <IonItem>
                  <IonLabel>
                    <b>Remarks:</b>
                  </IonLabel>
                  <IonText className="ion-text-end">{exp.remarks}</IonText>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <b>Amount:</b>
                  </IonLabel>
                  <IonText className="ion-text-end">QAR {exp.amount}</IonText>
                </IonItem>
              </IonList>
            </IonCard>
          ))
        ) : (
          <IonLabel>
            <center>
              <i>No records found</i>
            </center>
          </IonLabel>
        )}
      </div>
    );
  };

  const renderSLA = () => {
    return (
      <>
        {workOrder && workOrder?.service_providers?.length > 0 && (
          <>
            <h2 className="section-title">Services and SLAs</h2>
            {workOrder &&
              workOrder?.service_providers.map((item, index) => (
                <IonCard
                  className="task-card"
                  key={index}
                  onClick={() => handleOpenSLA(item, workOrder)}
                >
                  <IonCardHeader>
                    <b>Services and SLAs</b>
                  </IonCardHeader>
                  <IonItem>
                    <IonLabel>Service</IonLabel>
                    <IonText className="ion-text-end">
                      {item?.service?.service}
                    </IonText>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Provider</IonLabel>
                    <IonText>{item?.service_provider}</IonText>
                  </IonItem>
                  <IonItem>
                    <IonLabel>SLA</IonLabel>
                    <IonText>{item?.service?.sla?.sla_name}</IonText>
                  </IonItem>
                </IonCard>
              ))}
          </>
        )}
      </>
    );
  };

  const handleOpenSLA = (sla, workOrder) => {
    if (sla && workOrder) {
      history.push({
        pathname: "/sla",
        state: { sla: sla, workOrder: workOrder },
      });
    }
  };

  const handleDeleteSupply = async (supply) => {
    if (supply) {
      try {
        const req = await workOrderSupplyApi.delete(supply.id);
        console.log("req: " + JSON.stringify(req.data));
        await fetchSupplyList();
        await fetchWorkOrderDetails();
        await fetchActivityLogs();
      } catch (error) {
        console.log(
          "HandleDeleteSypply error: " + JSON.stringify(error.message)
        );
      }
    }
  };

  const handleDeleteExpense = async (exp) => {
    if (exp) {
      try {
        const req = await workOrderExpenseApi.delete(exp.id);
        console.log("req: " + JSON.stringify(req.data));
        await fetchExpenseList();
        await fetchWorkOrderDetails();
        await fetchActivityLogs();
      } catch (error) {
        console.log(
          "handleDeleteExpense error: " + JSON.stringify(error.message)
        );
      }
    }
  };

  const handleViewWOTasks = (task) => {
    modal.current?.dismiss();
    history.push({
      pathname: "/viewWO",
      state: { workOrderTasks: task },
    });
  };

  const handleSaveTask = async () => {
    console.log("new tasks: " + JSON.stringify(formTask));
    if (formTask.assignee_id && formTask.title && formTask.priority) {
      try {
        let req = workOrderTaskApi.store({
          assignee_id: formTask.assignee_id,
          description: formTask.description,
          priority: formTask.priority,
          status: "new",
          title: formTask.title,
          work_order_id: formTask.work_order_id,
        });
        // console.log("req:" + JSON.stringify(req));
        await fetchTasks();
        await setTasks((prevRecords) => [...prevRecords, formTask]);
        await setFormTask({
          work_order_id: id,
          assignee_id: "",
          title: "",
          description: "",
          priority: "",
        });
        await fetchActivityLogs();
      } catch (error) {
        console.log("handleSaveTask Error: " + error.message);
      }
    }
    setAddTask(false);
  };

  const handleUpdateRecords = () => {
    const state: any = history.location.state;
    if (state?.updatedTask) {
      setTasks((prevRecords) =>
        prevRecords.map((record) =>
          record.id === state.updatedTask.id ? state.updatedTask : record
        )
      );
      history.replace({ ...history.location, state: undefined });
    }
  };

  const handleSaveSupply = async (newSupply) => {
    console.log(
      "NewSupply: " +
        JSON.stringify(newSupply) +
        " | prevSupplies: " +
        JSON.stringify(workOrderSupplyList)
    );
    await fetchSupplyList();
    await fetchWorkOrderDetails();
    await fetchActivityLogs();
  };

  const handleSaveExpense = async () => {
    await fetchExpenseList();
    await fetchWorkOrderDetails();
    await fetchActivityLogs();
  };

  const handleDelete = async (assetId: number) => {
    deletePopupRef.current?.showDeleteConfirmation(
      "Are you sure you want to delete this asset?",
      async () => {
        try {
          const success = await deleteWorkOrderAsset(assetId);
          if (success) {
            refreshAssets();
          }
        } catch (error) {
          console.error("Error deleting asset:", error);
        }
      }
    );
  };

  return (
    <IonPage>
      <Header title="Work Order" />
      <IonContent className="ion-padding">
        <IonTabs>
          <IonTabBar
            slot="bottom"
            className="custom-tab-bar"
            style={{ overflowX: "auto", whiteSpace: "nowrap" }}
          >
            {tabs.map((tab) => (
              <IonTabButton
                key={tab.name}
                tab={tab.name}
                onClick={() => handleTabChange(tab.name)}
                className="custom-tab-button"
              >
                <IonIcon icon={tab.icon} className="custom-tab-icon" />
              </IonTabButton>
            ))}
          </IonTabBar>

          {tabs.map((tab) => (
            <IonTab key={tab.name} tab={tab.name}>
              <IonContent className="ion-padding">
                {workOrder ? (
                  <>
                    {/* Header Section */}
                    <IonGrid className="header-section">
                      <IonRow className="header-row">
                        <IonCol className="header-content ion-text-center">
                          <h2
                            className="work-order-header"
                            onClick={() => handleUpdateWorkOrder(workOrder)}
                          >
                            {workOrder.reference_number}
                            <BadgeComponent
                              status={workOrder.active_status.status}
                            />
                          </h2>
                          <Timeline key={timelineKey} workOrderId={id!} />{" "}
                          <IonLabel>
                            {
                              workOrder?.work_order_request
                                ?.work_order_description
                            }{" "}
                            |{" "}
                            {
                              workOrder?.work_order_request?.work_order_type
                                ?.work_order_type
                            }{" "}
                            <br />
                            <h3>
                              Starts on {workOrder?.start_date} ,{" "}
                              {
                                workOrder?.work_order_request?.schedule
                                  ?.start_time
                              }{" "}
                              -{" "}
                              {
                                workOrder?.work_order_request?.schedule
                                  ?.end_time
                              }
                            </h3>
                          </IonLabel>
                        </IonCol>
                      </IonRow>
                    </IonGrid>

                    {/* Update work order status */}
                    {updateWorkOrder && (
                      <ModalComponent1
                        title={"Update Work Order"}
                        isOpen={updateWorkOrder}
                        onClose={() => setUpdateWorkOrder(false)}
                        getContentModal={() =>
                          getContentModalUpdateWO(workOrder)
                        }
                      />
                    )}

                    <IonGrid className="header-section">
                      <IonItem lines="none">
                        <IonLabel>Total Cost: </IonLabel>
                        <IonText>
                          <IonChip>
                            <b>{workOrder?.total_cost}</b>
                          </IonChip>
                        </IonText>
                      </IonItem>
                    </IonGrid>

                    <div className="assets-section">
                      <div className="assets-header">
                        <IonLabel>Asset List</IonLabel>
                        <p>List of assets used in this work order.</p>
                      </div>
                      {assets.length > 0 ? (
                        <IonList className="assets-list">
                          {assets.map((asset, index) => (
                            <IonItem key={index} className="asset-item">
                              <IonGrid>
                                <IonRow className="align-items-center">
                                  <IonCol size="2">
                                    <div className="serial-number">
                                      <IonIcon
                                        icon={cubeOutline}
                                        className="cube-icon"
                                      />
                                      <IonText>{asset.serialNumber}</IonText>
                                    </div>
                                  </IonCol>
                                  <IonCol size="4">
                                    <IonText className="new-status">
                                      {asset.action}
                                    </IonText>
                                  </IonCol>
                                  <IonCol size="5">
                                    <IonText>{asset.description}</IonText>
                                  </IonCol>
                                  <IonCol size="1" className="text-right">
                                    <IonIcon
                                      icon={trashOutline}
                                      className="delete-icon"
                                      onClick={() => handleDelete(asset.id)} // Call delete function
                                      style={{
                                        cursor: "pointer",
                                        color: "red",
                                      }} // Make it clickable
                                    />
                                  </IonCol>
                                </IonRow>
                              </IonGrid>
                            </IonItem>
                          ))}
                        </IonList>
                      ) : (
                        <p>No assets found</p>
                      )}
                      <DeletePopup ref={deletePopupRef} />
                    </div>
                    {/* Render Tasks */}
                    {renderTasks()}

                    {/* Render SLAs */}
                    {renderSLA()}
                  </>
                ) : (
                  <Loading />
                )}
              </IonContent>
            </IonTab>
          ))}
        </IonTabs>
        {/* Modal Content */}
        <ModalComponent
          ref={modal}
          getModalContent={getModalContent}
          title={pageTitle}
        />
      </IonContent>
    </IonPage>
  );
};

export default WorkOrder;

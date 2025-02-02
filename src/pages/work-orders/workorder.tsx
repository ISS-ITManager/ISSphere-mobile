import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
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
  IonSpinner,
  IonCheckbox,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import {
  homeOutline,
  listOutline,
  documentTextOutline,
  settingsOutline,
  documentAttachOutline,
  cloudUploadOutline,
  informationCircleOutline,
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
  getGroups,
  getEntitiesByGroupId,
} from "../../api/api";
import BadgeComponent from "../../utilities/badgecomponent";
import Timeline from "../../utilities/workordertimelinecomponent";
import Details from "./workorder-components/details";
import Assets from "./workorder-components/assets";

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
  const [selectedAsset, setSelectedAsset] = useState<string | undefined>("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState<boolean>(false);
  const [pageTitle, setPageTitle] = useState("Work Order");

  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const [apiSuccess, setApiSuccess] = useState<boolean>(false);
  const [apiData, setApiData] = useState<any>(null);

  const [tasks, setTasks] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [entities, setEntities] = useState<any[]>([]);

  const [loadingTasks, setLoadingTasks] = useState<boolean>(false);

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
    { name: "task", icon: documentTextOutline },
    { name: "supplies", icon: settingsOutline },
  ];

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    modal.current?.present();
  };

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
    const fetchTasks = async () => {
      if (!id) return;

      setLoadingTasks(true);
      try {
        const response = await getWorkOrderTasks(id);
        if (response.success) {
          setTasks(response.data);
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
    fetchTasks();
  }, [id]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await getCategories();
        console.log("Fetched Categories Response:", response);
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
          console.log("Fetched Assets:", assets);
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

  useEffect(() => {
    console.log("Selected Group:", selectedGroup);
    if (selectedGroup !== null && selectedGroup !== undefined) {
      const fetchEntities = async () => {
        try {
          const data = await getEntitiesByGroupId(selectedGroup);
          console.log("Fetched Entities:", data);
          setEntities(data);
          console.log("Fetched Entitiess:", entities);
        } catch (err) {
          console.error("Error fetching entities:", err);
          setError("Failed to fetch entities");
        }
      };
      fetchEntities();
    }
  }, [selectedGroup]);

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
            onApplyFilter={handleApplyFilter}
            apiSuccess={apiSuccess}
            apiData={apiData}
          />
        );
      case "task":
        setPageTitle("Work Order Task");
      case "supplies":
        setPageTitle("Work Order Supplies");

        return (
          <IonList>
            <IonItem>
              <IonAvatar>
                <IonImg src="https://i.pravatar.cc/300?u=e" />
              </IonAvatar>
              <IonLabel>
                <h2>Supplies Information</h2>
                <p>This is some information specific to supplies.</p>
              </IonLabel>
            </IonItem>
          </IonList>
        );
      default:
        return null;
    }
  };

  const renderTasks = () => {
    const completedTasks = tasks.filter((task) => task.status === "Completed");

    return (
      <div className="timeline-container">
        <h2 className="section-title">Completed Tasks</h2>
        {completedTasks.map((task, index) => (
          <div key={task.id} className="task-container">
            {/* Vertical Timeline Line */}
            <div className="timeline-indicator">
              <div className="timeline-line"></div> {/* Continuous line */}
              <div className="circle"></div> {/* Circle for each task */}
            </div>

            {/* Task Card */}
            <div
              className="task-card bounce-in-right"
              style={{ animationDelay: `${index * 0.1}s` }} // Add delay for sequential animation
            >
              <div className="task-header">
                <h3 className="task-title">{task.title}</h3>
                <span
                  className={`task-badge ${
                    task.status ? task.status.toLowerCase() : "default"
                  }`}
                >
                  {task.status || "Unknown"}
                </span>
              </div>
              <p className="task-subtitle">Team members</p>
              <div className="task-members">
                {task.members &&
                  task.members.map((member, idx) => (
                    <img
                      key={idx}
                      src={member.avatar}
                      alt={`${member.name || "Unknown"}'s avatar`}
                      className="member-avatar"
                    />
                  ))}
              </div>
              <p className="task-days">{task.days || "No days specified"}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <IonPage>
      <Header title="Work Order" />
      <IonContent className="ion-padding">
        <IonTabs>
          <IonTabBar slot="bottom" className="custom-tab-bar">
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
                          <BadgeComponent
                            status={workOrder.active_status.status}
                          />
                          <h2 className="work-order-header">
                            Work Order #{workOrder.reference_number}
                          </h2>
                          <Timeline workOrderId={id!} />
                        </IonCol>
                      </IonRow>
                    </IonGrid>

                    {/* Attachments Section */}
                    <div className="attachments-section">
                      <div className="section-header">
                        <IonIcon
                          icon={documentAttachOutline}
                          className="section-icon"
                        />
                        <h3>Attach Documents</h3>
                      </div>
                      <IonItem lines="none" className="upload-container">
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
                              <IonIcon icon={closeCircleOutline} />
                            </IonButton>
                          </IonItem>
                        ))}
                      </IonList>
                    </div>

                    {/* Render Tasks */}
                    {renderTasks()}
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

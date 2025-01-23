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
  IonItemOption
} from "@ionic/react";
import {
  addOutline,
  saveOutline,
  listOutline,
  documentTextOutline,
  listCircle,
  documentAttachOutline,
  cloudUploadOutline,
  informationCircleOutline,
  timeOutline,
  personCircleOutline,
  cubeOutline,
  fileTrayFullOutline,
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
} from "../../api/api";
import BadgeComponent from "../../utilities/badgecomponent";
import Timeline from "../../utilities/workordertimelinecomponent";
import Details from "./workorder-components/details";
import Assets from "./workorder-components/assets";
import { formatDate, presentToast } from "../../utilities/globalfns";
import WorkOrderSupplies from "./workorder-components/supplies";

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
  const [selectedAsset, setSelectedAsset] = useState<string | undefined>("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState<boolean>(false);
  const [pageTitle, setPageTitle] = useState("Work Order");

  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const [apiSuccess, setApiSuccess] = useState<boolean>(false);
  const [apiData, setApiData] = useState<any>(null);

  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(false);
  const [assignees, setAssignees] = useState([]);
  const [addTask, setAddTask] = useState(false);
  const [formTask, setFormTask] = useState({
    work_order_id: id,
    assignee_id: '',
    title: '',
    description: '',
    priority: ''
  })
  const [activityLogs, setActivityLogs] = useState([]);
  // const [returnMsg, setReturnMsg] = useState<string>("");
  const [supplierList, setSupplierList] = useState([]);
  const [supplyCategory, setSupplyCategory] = useState([]);
  const [supplyList, setSupplyList] = useState([]);
  const [workOrderSupplyList, setWorkOrderSupplyList] = useState([]);
  const [openSupply, setOpenSupply] = useState(false);

  const handleApplyFilter = async () => {
    try {
      const response = await workOrderAssetsCreateApi.list({
        workOrderId: id,
        action: selectedAction,
        asset: selectedAsset,
        assetCategory: selectedCategory,
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
    { name: "activity", icon: timeOutline }
  ];

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    modal.current?.present();
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormTask(prevFormData => ({
      ...prevFormData,
      [name]: value
    }));
  };

  //fetch work order details
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
        const response = await getCategories(); // Call the corrected API function
        // console.log("Fetched Categories Response:", response); // Log the response to inspect it
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
          // console.log("Fetched Assets:", assets); // Log the fetched assets
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

  //fetch supply
  useEffect(() => {
    const fetchSupplyList = async () => {
      try {
        const req = await workOrderSupplyApi.list(id);
        // console.log("supplyList: " + JSON.stringify(req.data.data));
        setWorkOrderSupplyList(req.data.data);

      }
      catch (error) {
        console.log(error);

      }
    }
    const fetchSuppliers = async () => {
      try {
        const req = await supplierApi.list();
        // console.log("supplierList: " + JSON.stringify(req.data.data));

        setSupplierList(req.data.data);
      }
      catch (error) {

      }
    }

    const fetchSupplyCategory = async () => {
      try {
        const req = await supplyCategoryApi.list();
        // console.log("supplyCat: " + JSON.stringify(req.data.data));

        setSupplyCategory(req.data.data);
      }
      catch (error) {

      }
    }

    const fetchSupplies = async () => {
      try {
        const req = await supplyApi.list();
        // console.log("supplies: " + JSON.stringify(req.data.data));

        setSupplyList(req.data.data);
      }
      catch (error) {

      }
    }
    fetchSupplyList();
    fetchSuppliers();
    fetchSupplyCategory();
    fetchSupplies();
  }, [])

  //fetch activityLogs
  useEffect(() => {
    const fetchActivityLogs = async () => {
      if (id) {
        try {
          setLoading(true);
          const data = await WorkOrderActivityLogApi.list(id);
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
    }

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
    }
    fetchAssignees();
  }, [])

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
            onApplyFilter={handleApplyFilter}
            apiSuccess={apiSuccess}
            apiData={apiData}
          />
        );
      case "task":
        setPageTitle("Work Order Task");
        handleUpdateRecords();
        return (
          <div style={{ maxHeight: '70%', overflowY: 'auto' }}>
            <IonAccordionGroup multiple>
              <IonItem>
                <IonLabel><h2>Task List</h2></IonLabel>
                <IonButton
                  onClick={() => setAddTask(true)}
                  size="default"
                  slot="end"
                >
                  <IonIcon icon={addOutline} slot="start" />
                  Add
                </IonButton>
              </IonItem>
              {tasks
                .map((task, index) => (
                  <IonAccordion value={index} key={index} 
                  >
                    <IonItem slot="header" color="light" lines="full" detail={false}>
                      <IonLabel>
                        <h2 >{task.title}</h2>
                      </IonLabel>
                      <IonBadge
                        color={
                          task.priority === 'low' ? 'success' :
                            task.priority === 'medium' ? 'warning' :
                              task.priority === 'high' ? 'danger' :
                                'primary'
                        }
                        style={{ marginLeft: '8px' }}
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </IonBadge>
                    </IonItem>
                    <div className="ion-padding" slot="content" onClick={() => handleViewWOTasks(task)}>
                      <IonList>
                        <IonItem lines="none">
                          <IonLabel>
                            <h3>Description</h3>
                            {task.description}
                          </IonLabel>
                        </IonItem>
                        <IonItem lines="none">
                          <IonLabel>
                            <h4>Start Date</h4>
                            {formatDate(task.start_date)}
                          </IonLabel>
                        </IonItem>
                      </IonList>
                    </div>
                  </IonAccordion>
                ))}

              {tasks?.length === 0 && <IonLabel><center><i>No records found</i></center></IonLabel>}

              {addTask &&
                <IonModal
                  isOpen={addTask}
                  onDidDismiss={() => setAddTask(false)}
                >
                  <IonHeader>
                    <IonToolbar>
                      <IonTitle>Add Task</IonTitle>
                      <IonButtons slot="end">
                        <IonButton onClick={() => setAddTask(false)}>Close</IonButton>
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
                            <IonSelectOption value={person.id} key={index}>{person.first_name} {person.last_name}</IonSelectOption>
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
                    <IonButton
                      expand="block"
                      onClick={handleSaveTask}>
                      Save <IonIcon slot="start" icon={saveOutline} />
                    </IonButton>
                  </IonContent>
                </IonModal>
              }
            </IonAccordionGroup>
          </div>
        );

      case "supplies":
        setPageTitle("Work Order Supplies");

        return (
          // <WorkOrderSupplies workOrder={id} supplierList={supplierList} categoryList={supplyCategory} supplyList={supplyList} />

          < >
            <IonItem>
              <IonLabel><h2>Supply List</h2></IonLabel>
              <IonButton
                onClick={() => setOpenSupply(true)}
                size="default"
                slot="end"
              >
                <IonIcon icon={addOutline} slot="start" />
                Add
              </IonButton>
            </IonItem>
            <div style={{ maxHeight: '65%', overflowY: 'auto' }}>
              {renderSupplies()}

              {openSupply &&
                <IonModal
                  isOpen={openSupply}
                  onDidDismiss={() => setOpenSupply(false)}
                >
                  <IonHeader>
                    <IonToolbar>
                      <IonTitle>Add Supply</IonTitle>
                      <IonButtons slot="end">
                        <IonButton onClick={() => setOpenSupply(false)}>Close</IonButton>
                      </IonButtons>
                    </IonToolbar>
                  </IonHeader>
                  <WorkOrderSupplies workOrder={id} supplierList={supplierList} categoryList={supplyCategory} supplyList={supplyList} closeModal={() => setOpenSupply(false)} />
                </IonModal>
              }

            </div>
          </>

        );

      case "activity":
        setPageTitle("Activity Log");
        return (
          <IonContent style={{ maxHeight: '70%', overflowY: 'auto' }}>
            <div>
              {activityLogs && activityLogs.map((item, index) => (
                <IonCard key={index} className='ion-padding'>
                  {/* <IonItem> */}
                  <IonLabel>{formatDate(item.created_at)}</IonLabel><br />
                  <IonLabel><h2>{item.activity}</h2></IonLabel>
                  <IonIcon icon={personCircleOutline} /> <IonLabel>{item.first_name} {item.middle_name} {item.last_name}</IonLabel>
                  {/* </IonItem> */}
                </IonCard>
              ))}
            </div>
          </IonContent>
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
                  className={`task-badge ${task.status ? task.status.toLowerCase() : "default"
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

  const renderSupplies = () => {
    const rowStyle = {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      // padding: "1px 1px",
    };

    const labelStyle = {
      flex: "1",
      fontWeight: "bold",
      textAlign: "left",
    };

    const valueStyle = {
      flex: "2",
      textAlign: "right",
      // paddingLeft: "1px",
    };
    return (
      <div>
        {workOrderSupplyList && workOrderSupplyList?.map((stock, index) => (
          <IonCard key={index} className="bounce-in-right" color="light"
            style={{ animationDelay: `${index * 0.1}s` }}>
            <IonList >
              <IonItem lines="none" style={rowStyle} button={true} detail={false}>
                <div className="unread-indicator-wrapper" slot="start">
                  <div className="unread-indicator"></div>
                </div>
                <IonLabel style={labelStyle}>Supply:</IonLabel>
                <span style={valueStyle}>{stock.supply}</span>
              </IonItem>
              <IonItem lines="none" style={rowStyle}>
                <IonLabel style={labelStyle}>Supply Category:</IonLabel>
                <span style={valueStyle}>{stock.supply_category}</span>
              </IonItem>
              <IonItem lines="none" style={rowStyle}>
                <IonLabel style={labelStyle}>Supply:</IonLabel>
                <span style={valueStyle}>{stock.supply}</span>
              </IonItem>
              <IonItem lines="none" style={rowStyle}>
                <IonLabel style={labelStyle}>Cost:</IonLabel>
                <span style={valueStyle}>QAR {stock.cost}</span>
              </IonItem>
              <IonItem lines="none" style={rowStyle}>
                <IonLabel style={labelStyle}>Quantity:</IonLabel>
                <span style={valueStyle}>{stock.quantity} {stock.unit_of_measure}</span>
              </IonItem>
              <IonItem lines="none" style={rowStyle}>
                <IonLabel style={labelStyle}>Batch number:</IonLabel>
                <span style={valueStyle}>{stock.batch_number}</span>
              </IonItem>
            </IonList>
          </IonCard>
        ))}

        {workOrderSupplyList?.length === 0 && <IonLabel><center><i>No records found</i></center></IonLabel>}
      </div>
    )
  }

  const handleViewWOTasks = (task) => {
    modal.current?.dismiss();
    history.push({
      pathname: '/viewWO',
      state: { workOrderTasks: task }
    })
  }

  const handleSaveTask = () => {
    console.log("new tasks: " + JSON.stringify(formTask));

    try {
      let req = workOrderTaskApi.store(formTask);
      console.log("req:" + JSON.stringify(req));
      presentToast("Successfully saved");
      setAddTask(false);
      setTasks((prevRecords) => [...prevRecords, formTask]);
      setFormTask({ work_order_id: id, assignee_id: '', title: '', description: '', priority: '' });
    } catch (error) {
      presentToast("Error: " + error);
    }
  }

  const handleUpdateRecords = () => {
    const state: any = history.location.state;
    if (state?.updatedTask) {
      setTasks((prevRecords) =>
        prevRecords.map((record) => 
          record.id === state.updatedTask.id? state.updatedTask: record));
        history.replace({...history.location, state:undefined});
    }
  }
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

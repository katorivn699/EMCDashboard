import CalendarTask from "@/components/calendar/taskCalendar";
import TaskTable from "@/components/taskTable/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar1, Table } from "lucide-react";

export default function TaskPage() {
  return (
    <div className="p-5">
      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">
            <Table />
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar1 />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="table">
          <TaskTable />
        </TabsContent>
        <TabsContent value="calendar">
          <CalendarTask />
        </TabsContent>
      </Tabs>
    </div>
  );
}

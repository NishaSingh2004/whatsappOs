from sqlalchemy import Column, String, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from .tenant import TenantModel
import enum

class TaskStatus(str, enum.Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"
    BLOCKED = "BLOCKED"

class Project(TenantModel):
    __tablename__ = "projects"
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    jira_project_key = Column(String, nullable=True) # E.g., PROJ
    
    organization = relationship("Organization", back_populates="projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

class Task(TenantModel):
    __tablename__ = "tasks"
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(SQLEnum(TaskStatus), default=TaskStatus.TODO)
    jira_issue_id = Column(String, nullable=True) # E.g., PROJ-123
    
    project_id = Column(String, ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    assignee_id = Column(String, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User")
    comments = relationship("TaskComment", back_populates="task", cascade="all, delete-orphan")

class TaskComment(TenantModel):
    __tablename__ = "task_comments"
    content = Column(Text, nullable=False)
    task_id = Column(String, ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False)
    author_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    task = relationship("Task", back_populates="comments")
    author = relationship("User")

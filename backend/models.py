from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from database import Base

class Users(Base):
    __tablename__ = 'Users'

    ID = Column(Integer, primary_key=True, index= True)
    email = Column(String, nullable= False)
    first_name = Column(String, nullable= False)
    last_name = Column(String, nullable = False)
    password = Column(String, nullable = False)
    is_admin = Column(Boolean, nullable = False)
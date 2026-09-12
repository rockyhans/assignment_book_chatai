import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const DBMS_PAGES: Array<{ pageNumber: number; title: string; text: string }> = [
  {
    pageNumber: 1,
    title: "Title Page - Database Management Systems",
    text: `DATABASE MANAGEMENT SYSTEMS LECTURE NOTES
2nd Class, CS Dept.
1st Semester
Course Overview: Introduction to database concepts, relational data model, database architecture, E-R modeling, and Structured Query Language (SQL).`,
  },
  {
    pageNumber: 2,
    title: "UNIT-ONE: Introduction to Database Management System",
    text: `UNIT-ONE: Introduction to Database Management System
As the name suggests, the database management system consists of two parts. They are:
1. Database and
2. Management System

What is a Database?
To find out what database is, we have to start from data, which is the basic building block of any DBMS.
• Data: Facts, figures, statistics etc. having no particular meaning (e.g. 01, ABC, 19 etc).
• Record: Collection of related data items, e.g. in the above example the three data items had no meaning. However, if we organize them in the following way, then they collectively represent meaningful information: Roll 01, Name ABC, Age 19.
• Table or Relation: Collection of related records.
  Roll: 01, Name: ABC, Age: 19
  Roll: 02, Name: DEF, Age: 22
  Roll: 03, Name: XYZ, Age: 28
• The columns of this relation are called Fields, Attributes or Domains.
• The rows are called Tuples or Records.
=> Database: Collection of related relations.
Consider the following collection of tables:
Table T1: Roll (01, 02, 03), Name (ABC, DEF, XYZ), Age (19, 22, 28)
Table T2: Roll (01, 02, 03), Address (KOL, DEL, MUM)
Table T3: Roll (01, 02, 03), Year (I, II, I)`,
  },
  {
    pageNumber: 3,
    title: "Related Collection of Tables and User Views",
    text: `Table T4: Year (I, II), Hostel (H1, H2)
We now have a collection of four tables. They can be called a "related collection" because we can clearly find out that there are some common attributes existing in a selected pair of tables. Because of these common attributes, we may combine the data of two or more tables together to find out the complete details of a student.
Questions like "Which hostel does the youngest student live in?" can be answered now, although Age and Hostel attributes are in different tables.
A database in a DBMS could be viewed by lots of different people with different responsibilities.
Figure 1.1: Employees are accessing Data through DBMS.
For example, within a company there are different departments, as well as customers, who each need to see different kinds of data. Each employee in the company will have different levels of access to the database with their own customized front-end application.
In a database, data is organized strictly in row and column format. The rows are called Tuple or Record.
The data items within one row may belong to different data types.`,
  },
  {
    pageNumber: 4,
    title: "What is Management System? Goals and Definition of DBMS",
    text: `On the other hand, the columns are often called Domain or Attribute. All the data items within a single attribute are of the same data type.

What is Management System?
• A database-management system (DBMS) is a collection of interrelated data and a set of programs to access those data. This is a collection of related data with an implicit meaning and hence is a database. The collection of data, usually referred to as the database, contains information relevant to an enterprise.
• The primary goal of a DBMS is to provide a way to store and retrieve database information that is both convenient and efficient. By data, we mean known facts that can be recorded and that have implicit meaning.

The management system is important, why? Because without the existence of some kind of rules and regulations it is not possible to maintain the database. We have to select the particular attributes, which should be included in a particular table; the common attributes to create relationship between two tables; if a new record has to be inserted or deleted then which tables should have to be handled etc. These issues must be resolved by having some kind of rules to follow in order to maintain the integrity of the database.
• Database systems are designed to manage large bodies of information.
• Management of data involves both defining structures for storage of information and providing mechanisms for the manipulation of information.
In addition, the database system must ensure the safety of the information stored, despite system crashes or attempts at unauthorized access. If data are to be shared among several users, the system must avoid possible anomalous results.
Because information is so important in most organizations, computer scientists have developed a large body of concepts and techniques for managing data. This chapter briefly introduces the principles of database systems.

Database Management System (DBMS) and Its Applications:
A Database management system is a computerized record-keeping system. It is a repository or a container for collection of computerized data files. The overall purpose of DBMS is to allow the users to define, store, retrieve and update the information contained in the database on demand. Information can be anything that is of significance to an individual or organization.
Databases touch all aspects of our lives.`,
  },
  {
    pageNumber: 5,
    title: "Applications of Database Systems",
    text: `Major areas of database applications include:
1. Banking
2. Airlines
3. Universities
4. Manufacturing and selling
5. Human resources

• Enterprise Information:
- Sales: For customer, product, and purchase information.
- Accounting: For payments, receipts, account balances, assets and other accounting information.
- Human resources: For information about employees, salaries, payroll taxes, and benefits, and for generation of paychecks.
- Manufacturing: For management of the supply chain and for tracking production of items in factories, inventories of items in warehouses and stores, and orders for items.
- Online retailers: For sales data noted above plus online order tracking, generation of recommendation lists, and maintenance of online product evaluations.

• Banking and Finance:
- Banking: For customer information, accounts, loans, and banking transactions.
- Credit card transactions: For purchases on credit cards and generation of monthly statements.
• Finance: For storing information about holdings, sales, and purchases of financial instruments such as stocks and bonds; also for storing real-time market data to enable online trading by customers and automated trading by the firm.
• Universities: For student information, course registrations, and grades (in addition to standard enterprise information such as human resources and accounting).
• Airlines: For reservations and schedule information. Airlines were among the first to use databases in a geographically distributed manner.
• Telecommunication: For keeping records of calls made, generating monthly bills, maintaining balances on prepaid calling cards, and storing information about the communication networks.`,
  },
  {
    pageNumber: 6,
    title: "Purpose of Database Systems",
    text: `Purpose of Database Systems:
Database systems arose in response to early methods of computerized management of commercial data. As an example of such methods, typical of the 1960s, consider part of a university organization that, among other data, keeps information about all instructors, students, departments, and course offerings. One way to keep the information on a computer is to store it in operating system files. To allow users to manipulate the information, the system has a number of application programs that manipulate the files, including programs to:
✓ Add new students, instructors, and courses
✓ Register students for courses and generate class rosters
✓ Assign grades to students, compute grade point averages (GPA), and generate transcripts`,
  },
  {
    pageNumber: 7,
    title: "LECTURE TWO: Data vs Information and File-Oriented Approach",
    text: `LECTURE TWO - DBMS (Page 1)
INTRODUCTION TO BASIC CONCEPTS OF DATABASE SYSTEMS Cont.
What is Data?
The raw facts are called as data. The word "raw" indicates that they have not been processed.
For example, 89 is the data.

What is Information?
The processed data is known as information.
For example, Marks: 89; then it becomes information.

What is Knowledge?
1. Knowledge refers to the practical use of information.
2. Knowledge necessarily involves a personal experience.

DATA/INFORMATION PROCESSING:
The process of converting the data (raw facts) into meaningful information is called as data/information processing.
[DATA] -> When Processed -> [INFORMATION] -> When Processed -> [KNOWLEDGE]
Note: In business, processing knowledge is more useful to make decisions for any organization.

DIFFERENCE BETWEEN DATA AND INFORMATION:
Data:
a) Raw facts.
b) It is in unorganized form.
c) Data doesn't help in Decision making process.
Information:
a) Processed data.
b) It is in organized form.
c) Information helps in Decision making process.

FILE ORIENTED APPROACH:
The earliest business computer systems were used to process business records and produce information. They were generally faster and more accurate than equivalent manual systems.
These systems stored groups of records in separate files, and so they were called file processing systems.`,
  },
  {
    pageNumber: 8,
    title: "Disadvantages of File-Oriented Systems: Redundancy & Access",
    text: `LECTURE TWO - DBMS (Page 2)
1. File system is a collection of data. Any management with the file system, user has to write the procedures.
2. File system gives the details of the data representation and Storage of data.
3. In File system, storing and retrieving of data cannot be done efficiently.
4. Concurrent access to the data in the file system has many problems like reading the file while other deleting some information, updating some information.
5. File system does not provide crash recovery mechanism.
For example, while we are entering some data into the file if System crashes then content of the file is completely lost.
6. Protecting a file under file system is very difficult.
The typical file-oriented system is supported by a conventional operating system. Permanent records are stored in various files and a number of different application programs are written to extract records from and add records to the appropriate files.

DISADVANTAGES OF FILE-ORIENTED SYSTEM:
1. Data Redundancy and Inconsistency:
Since files and application programs are created by different programmers over a long period, the files are likely to be:
a) Having different formats and the programs may be written in several programming languages.
b) Moreover, the same piece of information may be duplicated in several places.
=> This redundancy leads to:
• Higher storage and access cost.
• In addition, it may lead to data inconsistency.
2. Difficulty in Accessing Data:
The conventional file processing environments do not allow needed data to be retrieved in a convenient and efficient manner. Better data retrieval system must be developed for general use.`,
  },
  {
    pageNumber: 9,
    title: "Disadvantages of File-Oriented Systems: Isolation, Concurrency, Security, Integrity, Atomicity",
    text: `LECTURE TWO - DBMS (Page 3)
3. Data Isolation:
Since data is scattered in various files, and files may be in different formats, it is difficult to write new application programs to retrieve the appropriate data.
4. Concurrent Access Anomalies:
In order to improve the overall performance of the system and obtain a faster response time, many systems allow multiple users to update the data simultaneously. In such an environment, interaction of concurrent updates may result in inconsistent data.
5. Security Problems:
Not every user of the database system should be able to access all the data. For example, in banking system, payroll personnel need only that part of the database that has information about various bank employees. They do not need access to information about customer accounts. It is difficult to enforce such security constraints.
6. Integrity Problems:
The data values stored in the database must satisfy certain types of consistency constraints. For example, the balance of a bank account may never fall below a prescribed amount. These constraints are enforced in the system by adding appropriate code in the various application programs. When new constraints are added, it is difficult to change the programs to enforce them. The problem is compounded when constraints involve several data items for different files.
7. Atomicity Problem:
A computer system like any other mechanical or electrical device is subject to failure. In many applications, it is crucial to ensure that once a failure has occurred and has been detected, the data are restored to the consistent state existed prior to the failure.

Example:
Consider part of a savings-bank enterprise that keeps information about all customers and savings accounts. One way to keep the information on a computer is to store it in operating system files. To allow users to manipulate the information, the system has a number of application programs that manipulate the files.`,
  },
  {
    pageNumber: 10,
    title: "File-Processing System Problems: Banking Example Details",
    text: `LECTURE TWO - DBMS (Page 4)
Application programs in banking:
• A program to debit or credit an account
• A program to add a new account
• A program to find the balance of an account
• A program to generate monthly statements
Programmers wrote these application programs to meet the needs of the bank. New application programs are added to the system as the need arises. For example, suppose that the savings bank decides to offer checking accounts.
As a result, the bank creates new permanent files that contain information about all the checking accounts maintained in the bank, and it may have to write new application programs to deal with situations that do not arise in savings accounts, such as overdrafts. Thus, as time goes by, the system acquires more files and more application programs.
The system stores permanent records in various files, and it needs different application programs to extract records from, and add records to, the appropriate files. Before database management systems (DBMS) came along, organizations usually stored information in such systems.
Organizational information in a file-processing system has a number of major disadvantages:
1. Data Redundancy and Inconsistency:
The address and telephone number of a particular customer may appear in a file that consists of savings-account records and in a file that consists of checking-account records. This redundancy leads to higher storage and access cost. In addition, it may lead to data inconsistency; that is, the various copies of the same data may no longer agree.
2. Difficulty in Accessing Data:
Suppose that one of the bank officers needs to find out the names of all customers who live within a particular postal-code area. The officer asks the data-processing department to generate such a list. Because there is no application program to generate that, the officer has to extract the data manually or ask a programmer.`,
  },
  {
    pageNumber: 11,
    title: "Atomicity and Concurrent-Access Anomalies in Detail",
    text: `LECTURE TWO - DBMS (Page 5)
3. Data Isolation: Because data are scattered in various files and files may be in different formats, writing new application programs to retrieve the appropriate data is difficult.
4. Integrity Problems: The balance of a bank account may never fall below a prescribed amount (say, $25). Developers enforce these constraints in the system by adding appropriate code in the various application programs.
5. Atomicity Problems: A computer system, like any other mechanical or electrical device, is subject to failure. In many applications, it is important that, if a failure occurs, the data be restored to the consistent state that existed prior to the failure.
Consider a program to transfer $50 from account A to account B. If a system failure occurs during the execution of the program, it is possible that the $50 was removed from account A but was not credited to account B, resulting in an inconsistent database state. Clearly, it is essential to database consistency that either both the credit and debit occur, or that neither occur. That is, the funds transfer must be atomic—it must happen in its entirety or not at all. It is difficult to ensure atomicity in a conventional file-processing system.
6. Concurrent-Access Anomalies:
For the sake of overall performance of the system and faster response, many systems allow multiple users to update the data simultaneously. In such an environment, interaction of concurrent updates may result in inconsistent data.
Consider bank account A, containing $500. If two customers withdraw funds (say $50 and $100 respectively) from account A at about the same time, the result of the concurrent executions may leave the account in an incorrect (or inconsistent) state. If both read $500 and write back $450 and $400, the account may contain $450 or $400 rather than the correct value of $350.`,
  },
  {
    pageNumber: 12,
    title: "Security Problems in File Systems",
    text: `LECTURE TWO - DBMS (Page 6)
Supervision is difficult to provide in file-processing systems because data may be accessed by many different application programs that have not been coordinated previously.
7. Security Problems:
Not every user of the database system should be able to access all the data. For example, in a banking system, payroll personnel need to see only that part of the database that has information about the various bank employees. They do not need access to information about customer accounts. But, since application programs are added to the system in an ad hoc manner, enforcing such security constraints is difficult. These difficulties, among others, prompted the development of database systems.`,
  },
  {
    pageNumber: 13,
    title: "LECTURE THREE: History of Database Systems",
    text: `LECTURE THREE - DBMS (Page 1)
History of Database Systems:
1950s and early 1960s:
• Magnetic tapes were developed for data storage.
• Data processing tasks such as payroll were automated, with data stored on tapes.
• Data could also be input from punched card decks, and output to printers.
Late 1960s and 1970s:
• The use of hard disks in the late 1960s changed the scenario for data processing greatly, since hard disks allowed direct access to data.
• With disks, network and hierarchical databases could be created that allowed data structures such as lists and trees to be stored on disk. Programmers could construct and manipulate these data structures.
• In the 1970s, E.F. Codd defined the Relational Model.
In the 1980s:
• Initial commercial relational database systems, such as IBM DB2, Oracle, Ingres, and DEC Rdb, played a major role in advancing techniques for efficient processing of declarative queries.
• In the early 1980s, relational databases had become competitive with network and hierarchical database systems even in the area of performance.
• The 1980s also saw much research on parallel and distributed databases, as well as initial work on object-oriented databases.
Early 1990s:
• The SQL language was designed primarily in the 1990s and used for transaction processing applications.
• Decision support and querying re-emerged as a major application area for databases.
• Database vendors also began to add object-relational support to their databases.`,
  },
  {
    pageNumber: 14,
    title: "Evolution of Database Systems: FMS & Hierarchical",
    text: `LECTURE THREE - DBMS (Page 2)
Late 1990s:
• The major event was the explosive growth of the World Wide Web.
• Databases were deployed much more extensively than ever before. Database systems now had to support very high transaction processing rates, as well as very high reliability and 24 * 7 availability (24 hours a day, 7 days a week, meaning no downtime for scheduled maintenance activities).
• Database systems also had to support Web interfaces to data.

The Evolution of Database systems:
The Evolution of Database systems are as follows:
1. File Management System (FMS)
2. Hierarchical Database System
3. Network Database System
4. Relational Database System

1) File Management System:
The file management system also called as FMS in short is one in which all data is stored on a single large file. The main disadvantage in this system is searching a record or data takes a long time. This led to the introduction of the concept of indexing in this system. Then also the FMS system had lot of drawbacks like updating or modifications to the data cannot be handled easily, sorting the records took long time and so on. All these drawbacks led to the introduction of the Hierarchical Database System.

2) Hierarchical Database System:
Structure: Root (parent) -> Level 1 (child) -> Level 2 (child).
The previous system FMS drawback of accessing records and sorting records which took a long time was addressed by introducing parent-child relationships between records.`,
  },
  {
    pageNumber: 15,
    title: "Network Database System & Relational Database System",
    text: `LECTURE THREE - DBMS (Page 3)
Hierarchical model drawback: The origin of the data is called the root from which several branches have data at different levels and the last level is called the leaf. The main drawback in this was if there is any modification or addition made to the structure then the whole structure needed alteration, which made the task a tedious one. In order to avoid this next system took its origin: Network Database System.

3) Network Database System:
In this, the main concept of many-to-many relationships got introduced. But this also followed the same technology of pointers to define relationships with a difference in this made in the introduction of grouping of data items as sets.
Structure: Project -> Project 1, Project 2 -> Department A, Department B, Department C.

4) Relational Database System (RDBS):
In order to overcome all the drawbacks of the previous systems, the Relational Database System got introduced in which data get organized as tables and each record forms a row with many fields or attributes in it. Relationships between tables are also formed in this system.
Table Example: CUSTOMER (CUSTOMER_ID, FIRST_NAME, LAST_NAME, PHONE, COUNTRY)`,
  },
  {
    pageNumber: 16,
    title: "Relationships in RDBS and Advantages of DBMS",
    text: `LECTURE THREE - DBMS (Page 4)
Figure: Relationship in RDBS between CUSTOMER and ORDER tables.
ORDER table: ORDER_ID, PRODUCT, TOTAL, CUSTOMER_ID (Foreign Key)
CUSTOMER table: CUSTOMER_ID (Primary Key), FIRST_NAME, LAST_NAME, PHONE, COUNTRY

Advantages of DBMS:
1) Controlling of Redundancy: Data redundancy refers to the duplication of data (i.e storing same data multiple times). In a database system, by having a centralized database and centralized control of data by the DBA the unnecessary duplication of data is avoided. It also eliminates the extra time for processing the large volume of data. It results in saving storage space.
2) Improved Data Sharing: DBMS allows a user to share the data in any number of application programs.
3) Data Integrity: Integrity means that the data in the database is accurate. Centralized control of the data helps in permitting the administrator to define integrity constraints to the data in the database. For example: in customer database, we can enforce an integrity that it must accept the customer only from Noida and Meerut city.
4) Security: Having complete authority over the operational data enables the DBA in ensuring that the only means of access to the database is through proper channels. The DBA can define authorization checks to be carried out whenever access to sensitive data is attempted.
5) Data Consistency: By eliminating data redundancy, we greatly reduce the opportunities for inconsistency.`,
  },
  {
    pageNumber: 17,
    title: "Advantages and Disadvantages of DBMS",
    text: `LECTURE THREE - DBMS (Page 5)
Advantages of DBMS (Cont.):
5) Data Consistency (Cont.): For example, if a customer address is stored only once, we cannot have disagreement on the stored values. Also updating data values is greatly simplified when each value is stored in one place only. Finally, we avoid the wasted storage that results from redundant data storage.
6) Efficient Data Access: In a database system, the data is managed by the DBMS and all access to the data is through the DBMS providing a key to effective data processing.
7) Enforcement of Standards: With the centralization of data, DBA can establish and enforce data standards which may include naming conventions, data quality standards etc.
8) Data Independence: In a database system, the database management system provides the interface between the application programs and the data. When changes are made to the data representation, the metadata obtained by the DBMS is changed but the DBMS continues to provide the data to application programs in the previously used way. The DBMS handles the task of transformation of data wherever necessary.
9) Reduced Application Development and Maintenance Time: DBMS supports many important functions that are common to many applications, accessing data stored in the DBMS, which facilitates the quick development of applications.

Disadvantages of DBMS:
1) Complexity: Since it supports multiple functionality to give the user the best, the underlying software has become complex. Designers and developers should have thorough knowledge about the software.
2) High Memory and Hardware Requirements: Because of its complexity and functionality, it uses a large amount of memory and needs large memory to run efficiently.
3) Centralized Failure Risk: DBMS system works on a centralized system; all users access this database. Hence any failure of the DBMS will impact all users.
4) Performance Overhead: DBMS is generalized software; it is written to work on entire systems rather than a specific one. Hence, some applications will run slow.`,
  },
  {
    pageNumber: 18,
    title: "LECTURE FOUR: View of Data & Data Abstraction Levels",
    text: `LECTURE FOUR - DBMS (Page 1)
View of Data:
A database system is a collection of interrelated data and a set of programs that allow users to access and modify these data. A major purpose of a database system is to provide users with an abstract view of the data. That is, the system hides certain details of how the data are stored and maintained.

Data Abstraction:
For the system to be usable, it must retrieve data efficiently. The need for efficiency has led designers to use complex data structures to represent data in the database. Since many database-system users are not computer trained, developers hide the complexity from users through several levels of abstraction, to simplify users' interactions with the system:
Three Levels of Abstraction in a DBMS:
1. View Level (View 1, View 2, View 3 ... View n) - Highest level
2. Conceptual / Logical Level - Middle level
3. Physical Level - Lowest level (Stored in DB)

A) Physical level (or Internal View / Schema):
The lowest level of abstraction describes how the data are actually stored. The physical level describes complex low-level data structures in detail.
B) Logical level (or Conceptual View / Schema):
The next-higher level of abstraction describes what data are stored in the database, and what relationships exist among those data. The logical level thus describes the entire database in terms of a small number of relatively simple structures.`,
  },
  {
    pageNumber: 19,
    title: "Data Abstraction: Physical Data Independence & Record Types",
    text: `LECTURE FOUR - DBMS (Page 2)
Although implementation of the simple structures at the logical level may involve complex physical-level structures, the user of the logical level does not need to be aware of this complexity. This is referred to as physical data independence.
Database administrators, who must decide what information to keep in the database, use the logical level of abstraction.

C) View level (or External View / Schema):
The highest level of abstraction describes only part of the entire database. Even though the logical level uses simpler structures, complexity remains because of the variety of information stored in a large database. Many users of the database system do not need all this information; instead, they need to access only a part of the database. The view level of abstraction exists to simplify their interaction with the system. The system may provide many views for the same database.

Analogy to programming languages:
type Instructor = record
  ID : char(5);
  name : char(20);
  dept_name : char(20);
  salary : numeric(8,2);
end;
This code defines a new record type called instructor with four fields. Each field has a name and a type associated with it. A university organization may have several such record types, including:
- Department (dept_name, building, budget)
- Course (course_id, title, dept_name, credits)
- Student (ID, name, dept_name, tot_cred)
At the physical level, an Instructor, Department, or Student record can be described as a block of consecutive storage locations.`,
  },
  {
    pageNumber: 20,
    title: "Instances and Schemas: Physical, Logical & Subschemas",
    text: `LECTURE FOUR - DBMS (Page 3)
Programmers using a programming language work at the logical level of abstraction. Similarly, database administrators usually work at this level of abstraction.
Finally, at the view level, computer users see a set of application programs that hide details of the data types. At the view level, several views of the database are defined, and a database user sees some or all of these views.
In addition to hiding details of the logical level of the database, the views also provide a security mechanism to prevent users from accessing certain parts of the database. For example, clerks in the university registrar office can see only that part of the database that has information about students; they cannot access information about salaries of instructors.

Instances and Schemas:
Databases change over time as information is inserted and/or deleted.
• Instance: The collection of information stored in the database at a particular moment is called an instance of the database.
• Schema: The overall design of the database is called the database schema. Schemas are changed infrequently, if at all.
Analogy: A database schema corresponds to variable declarations in a program. Each variable has a particular value at a given instant; the values correspond to an instance of a database schema.
Database systems have several schemas partitioned according to abstraction levels:
1. Physical schema: describes the database design at the physical level.
2. Logical schema: describes the database design at the logical level.
3. Subschemas: describe different views of the database at the view level.`,
  },
  {
    pageNumber: 21,
    title: "Data Models: Relational, E-R, Object-Based, Semi-structured",
    text: `LECTURE FOUR - DBMS (Page 4)
Physical Data Independence: Application programs are said to exhibit physical data independence if they do not depend on the physical schema, and thus need not be rewritten if the physical schema changes.

Data Models:
Underlying the structure of a database is the data model: a collection of conceptual tools for describing data, data relationships, data semantics, and consistency constraints. A data model provides a way to describe the design of a database at the physical, logical, and view levels.
Four categories of data models:
A) Relational Model:
Uses a collection of tables to represent both data and the relationships among those data. Each table has multiple columns, and each column has a unique name. Tables are also known as relations. Relational model is an example of a record-based model where fixed-format records define attributes. Most widely used data model today.
B) Entity-Relationship Model (E-R Model):
Uses a collection of basic objects called entities, and relationships among these objects. An entity is a "thing" or "object" in the real world distinguishable from other objects. Widely used in database design.
C) Object-Based Data Model:
Extends the E-R model with notions of encapsulation, methods (functions), and object identity (e.g. Java, C++, C#). Combines features of object-oriented and relational models.
D) Semi-structured Data Model:
Permits specification of data where individual data items of the same type may have different sets of attributes (e.g. XML, JSON).`,
  },
  {
    pageNumber: 22,
    title: "Database Languages: DML (Procedural & Declarative) & DDL",
    text: `LECTURE FOUR - DBMS (Page 5)
Historically, the network data model and hierarchical data model preceded the relational model.

Database Languages:
A database system provides a data-definition language (DDL) to specify the database schema and a data-manipulation language (DML) to express database queries and updates. In practice, DDL and DML simply form parts of a single database language, such as SQL.

(1) Data-Manipulation Language (DML):
Enables users to access or manipulate data organized by the appropriate data model:
- Retrieval of information stored in the database
- Insertion of new information
- Deletion of information
- Modification of information
Two types of DML:
(a) Procedural DMLs: require a user to specify what data are needed and how to get those data.
(b) Declarative DMLs (Nonprocedural DMLs): require a user to specify what data are needed without specifying how to get those data.
Declarative DMLs are easier to learn and use. The system figures out an efficient access plan. A query is a statement requesting retrieval of information; the portion of DML for retrieval is called a query language.`,
  },
  {
    pageNumber: 23,
    title: "Data-Definition Language (DDL) & Integrity Constraints",
    text: `LECTURE FOUR - DBMS (Page 6)
(2) Data-Definition Language (DDL):
We specify a database schema by a set of definitions expressed by a special language called a Data-Definition Language (DDL). The DDL is also used to specify additional properties of the data, storage structure, and access methods.
The data values stored in the database must satisfy certain consistency constraints:
A) Domain Constraints: A domain of possible values must be associated with every attribute (e.g., integer, character, date/time). Declaring an attribute domain acts as a constraint on values it can take.
B) Referential Integrity: There are cases where a value appearing in one relation for a given set of attributes must also appear in a certain set of attributes in another relation (e.g., dept_name in course must appear in department). When violated, the system rejects the action.
C) Assertions: An assertion is any condition that the database must always satisfy (e.g., "Every department must have at least five courses offered every semester").`,
  },
  {
    pageNumber: 24,
    title: "Authorization & Data Dictionary",
    text: `LECTURE FOUR - DBMS (Page 7)
D) Authorization:
We may want to differentiate among users as far as the type of access permitted on various data values:
- Read authorization: allows reading, but not modification, of data
- Insert authorization: allows insertion of new data, but not modification of existing data
- Update authorization: allows modification, but not deletion, of data
- Delete authorization: allows deletion of data.

Data Dictionary:
The DDL statements generate output placed in the data dictionary, which contains metadata—that is, data about data. The data dictionary is considered to be a special type of table that can only be accessed and updated by the database system itself (not a regular user). The database system consults the data dictionary before reading or modifying actual data.`,
  },
  {
    pageNumber: 25,
    title: "LECTURE FIVE: Database Languages DML & DDL Review",
    text: `Lecture 5 - DBMS (Page 1)
Database Languages:
A database system provides a data-definition language to specify the database schema and a data-manipulation language to express database queries and updates.
(1) Data-Manipulation Language (DML):
Types of access:
- Retrieval of information stored in the database
- Insertion of new information into the database
- Deletion of information from the database
- Modification of information stored in the database
A query is a statement requesting the retrieval of information. The portion of a DML that involves information retrieval is called a query language.
(2) Data-Definition Language (DDL):
We specify a database schema by a set of definitions expressed by a special language called a data-definition language (DDL).`,
  },
  {
    pageNumber: 26,
    title: "Storage Structure, Domain Constraints & Referential Integrity",
    text: `Lecture 5 - DBMS (Page 2)
We specify the storage structure and access methods used by the database system by statements in a data storage and definition language.
Consistency Constraints:
A) Domain Constraints: Associated with every attribute (integer, character, date/time). The most elementary form of integrity constraint.
B) Referential Integrity: Ensures that a value appearing in one relation for a given set of attributes also appears in another relation (e.g., course department must exist in department relation).
C) Assertions: Any condition that the database must always satisfy.`,
  },
  {
    pageNumber: 27,
    title: "Authorization & Data Dictionary: Active vs Passive",
    text: `Lecture 5 - DBMS (Page 3)
D) Authorization: Read, Insert, Update, and Delete authorization permissions.

Data Dictionary:
We can define a data dictionary as a DBMS component that stores the definition of data characteristics and relationships (metadata).
Two main types of data dictionary exist:
1. Integrated data dictionary: included with the DBMS (system catalog) and frequently accessed and updated by the RDBMS.
2. Stand-alone data dictionary: used by older systems or third-party tools.

Classification of Data Dictionaries:
• Active Data Dictionary: Automatically updated by the DBMS with every database access, keeping access information up-to-date in real time.
• Passive Data Dictionary: Not updated automatically; usually requires a batch process to be run.`,
  },
  {
    pageNumber: 28,
    title: "Data Dictionary Functions & Database Administrator (DBA)",
    text: `Lecture 5 - DBMS (Page 4)
The data dictionary's main function is to store the description of all objects that interact with the database. It provides database designers and end users with an improved ability to communicate and helps the DBA resolve data conflicts.

Database Administrators (DBA):
A Database Administrator (DBA) is a person or team who defines the schema and controls the 3 levels of database abstraction.
Responsibilities of DBA:
• Creates new account IDs and passwords for users needing access.
• Responsible for providing security to the database and allowing only authorized users to access/modify data.
• Monitors recovery and backup procedures and provides technical support.
• Has a special DBA super-user account in the DBMS.
• Repairs damage caused due to hardware and/or software failures.`,
  },
  {
    pageNumber: 29,
    title: "Types of Database Users: Naive, Programmers & RAD Tools",
    text: `Lecture 5 - DBMS (Page 5)
Database Users and User Interfaces:
Four different types of database-system users:
1. Naive users / End Users: Unsophisticated users who interact with the system by invoking previously written application programs (e.g. bank teller using a transfer program).
2. Application programmers: Computer professionals who write application programs using tools and programming languages.
   - Rapid Application Development (RAD) tools: Enable programmers to construct forms and reports without writing complex code.
   - Fourth-generation languages: Combine imperative control structures with data manipulation language statements.`,
  },
  {
    pageNumber: 30,
    title: "Sophisticated Users, OLAP, Data Mining & Specialized Users",
    text: `Lecture 5 - DBMS (Page 6)
3. Sophisticated users: Interact with the system without writing programs. They form requests in database query languages and submit them to the query processor.
   - Online Analytical Processing (OLAP) tools: Simplify analysis by letting users view summaries of data in different ways (e.g. sales by region, product, category).
   - Data mining tools: Help analysts find hidden patterns and trends in vast data.
4. Specialized users: Write specialized database applications that do not fit into the traditional framework (e.g. CAD systems, knowledge-based expert systems, multimedia graphics and audio systems).`,
  },
  {
    pageNumber: 31,
    title: "LECTURE SIX: Database Architecture & System Components",
    text: `Lecture 6 - DBMS (Page 1)
Database Architecture:
The architecture of a database system is greatly influenced by the underlying computer system.
Types of systems: Centralized, Client-Server, Parallel architectures, and Distributed databases spanning geographically separated machines.

Database System Architecture:
The functional components of a database system are broadly divided into:
1. Storage Manager component: Handles storage allocation, file organization, buffer caching, transaction logging, and data integrity.
2. Query Processor component: Simplifies and facilitates data access, parsing, compiling, optimizing, and evaluating user queries.
Users interact with interfaces: Naive users (application interfaces), Application programmers (application programs), Sophisticated users (query tools), DBA (administration tools).`,
  },
  {
    pageNumber: 32,
    title: "Two-Tier and Three-Tier Client-Server Architectures",
    text: `Lecture 6 - DBMS (Page 2)
Two-Tier vs Three-Tier Architectures:
• Two-Tier Architecture: The application resides at the client machine and directly invokes database system functionality at the server machine through query language statements. Standards like ODBC and JDBC are used for interaction between client and server.
• Three-Tier Architecture: The client machine acts as merely a front-end user interface without direct database calls. The client communicates with an application server (business logic layer), which in turn communicates with the database system to access data.
Three-tier architecture is more appropriate for large enterprise applications and web applications (World Wide Web).`,
  },
  {
    pageNumber: 33,
    title: "Query Processor and Storage Manager Detailed Modules",
    text: `Lecture 6 - DBMS (Page 3)
Query Processor Components:
1. DDL interpreter: Interprets DDL statements and records definitions in data dictionary.
2. DML compiler: Translates DML statements into an evaluation plan of low-level instructions. Performs query optimization to choose the lowest-cost evaluation plan.
3. Query evaluation engine: Executes low-level instructions generated by DML compiler.

Storage Manager Components:
Responsible for storing, retrieving, and updating data on disk using OS file system commands.
1. Authorization and integrity manager: Tests satisfaction of integrity constraints and checks authority.
2. Transaction manager: Ensures database remains in consistent state despite system failures.
3. File manager: Manages allocation of disk space and storage structures.`,
  },
  {
    pageNumber: 34,
    title: "Buffer Manager, Transaction Manager & ER Modeling Intro",
    text: `Lecture 6 - DBMS (Page 4)
Buffer Manager:
Responsible for fetching data from disk storage into main memory and deciding what data to cache. Enables the database to handle data sizes much larger than physical main memory.

Transaction Manager:
A transaction is a collection of operations that performs a single logical function in a database application. Each transaction is a unit of both atomicity and consistency. The transaction manager ensures consistency despite system power failures and crashes.

Conceptual Database Design - Entity Relationship (ER) Modeling:
Database Design Techniques:
1. ER Modeling (Top-down approach)
2. Normalization (Bottom-up approach)
What is ER Modeling?
A graphical technique for understanding and organizing data independent of actual database implementation.
Entity: Anything that has an independent existence about which data is collected (represented by a rectangle).`,
  },
  {
    pageNumber: 35,
    title: "Entity, Weak Entity, Attributes & Domain of Attributes",
    text: `Lecture 6 - DBMS (Page 5)
Entity Instance: A particular member of an entity type (e.g. a particular employee).
Regular Entity: An entity that has its own key attribute (represented by a single rectangle).
Weak Entity: An entity that depends on another entity for its existence and does not have any key attribute of its own. In a parent/child relationship, parent is strong entity and child is weak entity (represented by a double rectangle).

Attributes: Properties or characteristics describing entities (represented by an ellipse/oval).
Domain of Attributes: The set of possible values an attribute can take (e.g. day attribute domain: {Monday, Tuesday... Friday}).`,
  },
  {
    pageNumber: 36,
    title: "Types of Attributes: Key, Simple, Composite, Single & Multi-valued",
    text: `Lecture 6 - DBMS (Page 6)
Types of Attributes in ER Modeling:
1. Key attribute: The attribute unique for every entity instance (e.g. employee_id, pan_card_number; underlined in oval). If composed of multiple attributes, it is a composite key.
2. Simple attribute: Cannot be divided into simpler components (e.g. employee_id).
3. Composite attribute: Can be split into sub-components (e.g. Name split into First_name, Middle_name, Last_name).
4. Single-valued attribute: Can take only a single value for each entity instance (e.g. age of student).
5. Multi-valued attribute: Can take more than one value for each entity instance (e.g. telephone_number; represented by double oval).`,
  },
  {
    pageNumber: 37,
    title: "Stored vs Derived Attributes and Relationships",
    text: `Lecture 6 - DBMS (Page 7)
Stored Attribute: An attribute that needs to be stored permanently in the database (e.g. name of a student, date of birth).
Derived Attribute: An attribute calculated or derived based on other attributes (e.g. age derived from date of birth and current date; represented by dashed oval).

Relationships:
Associations between entities are called relationships (represented by a diamond).
Example: An employee works for an organization. "Works for" is the relationship between entity employee and entity organization.`,
  },
  {
    pageNumber: 38,
    title: "Degree and Cardinality of Relationships (1:1, 1:N, M:1)",
    text: `Lecture 6 - DBMS (Page 8)
Weak Relationship: Used to connect a weak entity with other entities (represented by a double diamond).
Degree of a Relationship: The number of entity types involved:
- Unary relationship (degree 1): e.g. An employee is a manager of another employee.
- Binary relationship (degree 2): e.g. An employee works-for department.
- Ternary relationship (degree 3): e.g. Customer purchases item from a shop keeper.

Cardinality of a Relationship:
Specifies how many of each entity type can participate in the relationship:
1. One to one (1:1)
2. One to many (1:N)
3. Many to one (M:1)
4. Many to many (M:N)`,
  },
  {
    pageNumber: 39,
    title: "Cardinality Examples: One-to-One (1:1) and One-to-Many",
    text: `Lecture 6 - DBMS (Page 9)
Example for Cardinality - One-to-One (1:1):
Employee is assigned with a parking space: E1->P1, E2->P2, E3->P3, E4->P4, E5->P5.
One employee is assigned with only one parking space, and one parking space is assigned to only one employee.
Notation: [Employee] -(1)--- <Assigned With> ---(1)- [Parking Space]`,
  },
  {
    pageNumber: 40,
    title: "Cardinality Examples: One-to-Many (1:N) and Many-to-One (M:1)",
    text: `Lecture 6 - DBMS (Page 10)
Example for One-to-Many (1:N):
Organization has employees: Organization O1 has employees E1, E2, E3; O2 has E4, E5; O3 has E6.
One organization can have many employees, but an employee works in only one organization.
Notation: [Organization] -(1)--- <Has> ---(N)- [Employee]

Example for Many-to-One (M:1):
Reverse of One-to-Many: Employee works in organization.
Many employees work in one organization.
Notation: [Employee] -(M)--- <Works In> ---(1)- [Organization]`,
  },
  {
    pageNumber: 41,
    title: "Cardinality Examples: Many-to-Many (M:N)",
    text: `Lecture 6 - DBMS (Page 11)
Example for Many-to-Many (M:N):
Students enroll for courses:
Student S1 enrolls in C1, C2; S2 enrolls in C1, C3; S3 enrolls in C2, C4; S4 enrolls in C3; S5 enrolls in C4.
One student can enroll for many courses, and one course can be enrolled by many students.
Notation: [Student] -(M)--- <Enrolls> ---(N)- [Course]`,
  },
  {
    pageNumber: 42,
    title: "Relationship Participation (Total vs Partial) & ER Advantages",
    text: `Lecture 6 - DBMS (Page 12)
Relationship Participation:
1. Total Participation: Every entity instance must be connected through the relationship to another instance of the participating entity type (represented by double line).
2. Partial Participation: Only some entity instances participate in the relationship (represented by single line).
Example: "Employee is head of department" -> Only one employee is head of department (partial participation for employee), but every department must have a head (total participation for department).

Advantages of ER Modeling:
1. Simple and easily understandable by non-technical specialists.
2. Intuitive and directly aids physical database creation.
3. Can be generalized and specialized based on requirements.`,
  },
  {
    pageNumber: 43,
    title: "Disadvantages of ER Modeling",
    text: `Lecture 6 - DBMS (Page 13)
4. Helps in database design and gives a high-level description of the system.
Disadvantages of ER Modeling:
1. Physical design derived from E-R model may have ambiguities or inconsistencies.
2. Diagrams may sometimes lead to misinterpretations or oversimplifications.`,
  },
  {
    pageNumber: 44,
    title: "LECTURE SEVEN: Relational Model Structure & Mathematical Basis",
    text: `Lecture 7 - DBMS (Page 1)
Relational Model:
Structure of Relational Databases:
A relational database consists of a collection of tables, each assigned a unique name.
Figure 1: The instructor relation (ID, name, dept_name, salary).
Mathematical Concept:
In general, a row in a table represents a relationship among a set of values. In mathematical terminology, a tuple is simply a sequence (or list) of values. A relationship between n values is represented mathematically by an n-tuple of values, which corresponds to a row in a table.`,
  },
  {
    pageNumber: 45,
    title: "Relations, Tuples, Attributes & Relation Instances",
    text: `Lecture 7 - DBMS (Page 2)
Terminology in Relational Model:
- Relation corresponds to Table
- Tuple corresponds to Row
- Attribute corresponds to Column
Figure 2: Course relation (course_id, title, dept_name, credits)
Figure 3: Prereq relation (course_id, prereq_id)
Attributes of Instructor relation: ID, name, dept_name, salary.
Relation Instance: Refers to a specific instance of a relation containing a specific set of rows at a point in time (e.g. instructor instance with 12 tuples).`,
  },
  {
    pageNumber: 46,
    title: "Order of Tuples, Attribute Domains & The NULL Value",
    text: `Lecture 7 - DBMS (Page 3)
Order of Tuples: The order in which tuples appear in a relation is irrelevant since a relation is mathematically a set of tuples.
Domain of Attribute: For each attribute, there is a set of permitted values called the domain of that attribute (e.g. salary domain is set of positive monetary numbers).
The NULL Value: A special value that signifies that the value is unknown or does not exist (e.g. unlisted phone number).`,
  },
  {
    pageNumber: 47,
    title: "Database Schema, Superkey & Candidate Key",
    text: `Lecture 7 - DBMS (Page 4)
Database Schema vs Instance:
- Database Schema: Logical design of database (e.g. department(dept_name, building, budget)).
- Database Instance: Snapshot of data at a given instant in time.

Keys in Relational Model:
1. Superkey: A set of one or more attributes that, taken collectively, allows us to identify uniquely a tuple in the relation (e.g. ID attribute of instructor).
2. Candidate Key: A minimal superkey; no proper subset of candidate key is a superkey (e.g. ID, or combination of {name, dept_name} if unique).`,
  },
  {
    pageNumber: 48,
    title: "Primary Key, Foreign Key & Schema Diagrams",
    text: `Lecture 7 - DBMS (Page 5)
Primary Key: A candidate key chosen by the database designer as the principal means of identifying tuples within a relation (underlined in schemas).
Foreign Key: An attribute in relation r1 that is the primary key of another relation r2 (referencing r2).
Schema Diagrams:
Depicts relation schemas, primary keys (underlined), and foreign key dependencies (arrows pointing from referencing attribute to referenced primary key).`,
  },
  {
    pageNumber: 49,
    title: "Schema Diagram for University Database",
    text: `Lecture 7 - DBMS (Page 6)
Figure 6: Schema diagram for the university database.
Relations and Foreign Keys:
- student (ID, name, dept_name, tot_cred)
- takes (ID, course_id, sec_id, semester, year, grade)
- advisor (s_id, i_id)
- instructor (ID, name, dept_name, salary)
- department (dept_name, building, budget)
- course (course_id, title, dept_name, credits)
- prereq (course_id, prereq_id)
- section (course_id, sec_id, semester, year, building, room_no, time_slot_id)
- teaches (ID, course_id, sec_id, semester, year)
- classroom (building, room_no, capacity)
- time_slot (time_slot_id, day, start_time, end_time)`,
  },
  {
    pageNumber: 50,
    title: "SQL: Structured Query Language & SELECT Statement",
    text: `Structured Query Language (SQL) (Page 1)
A database most often contains one or more tables. Each table is identified by a name (e.g. "Customers" or "Orders"). Tables contain records (rows) with data.
Example Customers table: CustomerID, CustomerName, ContactName, Address, City, PostalCode, Country.
Records include: Alfreds Futterkiste (Berlin, Germany), Ana Trujillo (Mexico), Antonio Moreno (Mexico), Around the Horn (London, UK), Berglunds snabbkop (Sweden).

SQL Statements:
Most actions on a database are done with SQL statements.
Example: SELECT * FROM Customers;`,
  },
  {
    pageNumber: 51,
    title: "SQL Case Sensitivity, Semicolons & Major SQL Commands",
    text: `Structured Query Language (SQL) (Page 2)
Keep in Mind That:
• SQL keywords are NOT case sensitive: select is the same as SELECT.
• Semicolon after SQL Statements: Standard way to separate each SQL statement in database systems that allow multiple statements.

Most Important SQL Commands:
• SELECT - extracts data from a database
• UPDATE - updates data in a database
• DELETE - deletes data from a database
• INSERT INTO - inserts new data into a database
• CREATE DATABASE - creates a new database
• ALTER DATABASE - modifies a database
• CREATE TABLE - creates a new table
• ALTER TABLE - modifies a table
• DROP TABLE - deletes a table
• CREATE INDEX - creates an index (search key)
• DROP INDEX - deletes an index

SQL SELECT Statement:
Used to select data from a database.`,
  },
  {
    pageNumber: 52,
    title: "SQL SELECT Syntax and Examples",
    text: `Structured Query Language (SQL) (Page 3)
The data returned is stored in a result table called the result-set.
SELECT Syntax:
SELECT column1, column2, ...
FROM table_name;

To select all fields:
SELECT * FROM table_name;

Examples:
SELECT CustomerName, City FROM Customers;
SELECT * FROM Customers;`,
  },
  {
    pageNumber: 53,
    title: "SQL WHERE Clause: Syntax and Filtering",
    text: `Structured Query Language (SQL) (Page 1)
The SQL WHERE Clause:
The WHERE clause is used to filter records. It extracts only those records that fulfill a specified condition.
Syntax:
SELECT column1, column2, ...
FROM table_name
WHERE condition;

Note: The WHERE clause is also used in UPDATE, DELETE, etc.!
Examples:
SELECT * FROM Customers
WHERE Country = 'Mexico';

Numeric fields should not be enclosed in quotes:
SELECT * FROM Customers
WHERE CustomerID = 1;`,
  },
  {
    pageNumber: 54,
    title: "SQL ORDER BY Keyword: ASC and DESC",
    text: `Structured Query Language (SQL) (Page 2)
The SQL ORDER BY Keyword:
Used to sort the result-set in ascending or descending order.
Sorts in ascending order by default. Use DESC keyword for descending order.
Syntax:
SELECT column1, column2, ...
FROM table_name
ORDER BY column1, column2, ... ASC|DESC;

Examples:
SELECT * FROM Customers
ORDER BY Country;

SELECT * FROM Customers
ORDER BY Country DESC;

Several Columns Example:
SELECT * FROM Customers
ORDER BY Country, CustomerName;`,
  },
  {
    pageNumber: 55,
    title: "SQL INSERT INTO Statement",
    text: `Structured Query Language (SQL) (Page 3)
The SQL INSERT INTO Statement:
Used to insert new records in a table.
Two ways to write INSERT INTO:
1. Specify both column names and values:
INSERT INTO table_name (column1, column2, column3, ...)
VALUES (value1, value2, value3, ...);

2. Add values for all columns in table order:
INSERT INTO table_name
VALUES (value1, value2, value3, ...);

Examples:
INSERT INTO Customers (CustomerName, ContactName, Address, City, PostalCode, Country)
VALUES ('Cardinal', 'Tom B. Erichsen', 'Skagen 21', 'Stavanger', '4006', 'Norway');

INSERT INTO Customers (CustomerName, City, Country)
VALUES ('Cardinal', 'Stavanger', 'Norway');`,
  },
  {
    pageNumber: 56,
    title: "SQL UPDATE Statement: Single and Multiple Records",
    text: `Structured Query Language (SQL) (Page 4)
The SQL UPDATE Statement:
Used to modify existing records in a table.
Syntax:
UPDATE table_name
SET column1 = value1, column2 = value2, ...
WHERE condition;

Caution: Notice the WHERE clause in the UPDATE statement! If you omit the WHERE clause, all records in the table will be updated!

Examples:
UPDATE Customers
SET ContactName = 'Alfred Schmidt', City = 'Frankfurt'
WHERE CustomerID = 1;

UPDATE Customers
SET ContactName = 'Juan'
WHERE Country = 'Mexico';`,
  },
  {
    pageNumber: 57,
    title: "SQL DELETE Statement: Single and All Records",
    text: `Structured Query Language (SQL) (Page 5)
The SQL DELETE Statement:
Used to delete existing records in a table.
Syntax:
DELETE FROM table_name WHERE condition;

Caution: If you omit the WHERE clause, all records in the table will be deleted!
Example:
DELETE FROM Customers WHERE CustomerName = 'Alfreds Futterkiste';

Delete All Records:
It is possible to delete all rows in a table without deleting the table structure:
DELETE FROM table_name;
Example: DELETE FROM Customers;`,
  },
  {
    pageNumber: 58,
    title: "SQL Aggregate Functions: MIN() and MAX()",
    text: `Structured Query Language (SQL) (Page 6)
The SQL MIN() and MAX() Functions:
• MIN() function returns the smallest value of the selected column.
• MAX() function returns the largest value of the selected column.
Syntax:
SELECT MIN(column_name) FROM table_name WHERE condition;
SELECT MAX(column_name) FROM table_name WHERE condition;

Examples:
SELECT MIN(Price) AS SmallestPrice FROM Products;
SELECT MAX(Price) AS LargestPrice FROM Products;`,
  },
  {
    pageNumber: 59,
    title: "SQL Aggregate Functions: COUNT(), AVG() and SUM()",
    text: `Structured Query Language (SQL) (Page 7)
The SQL COUNT(), AVG() and SUM() Functions:
• COUNT() function returns the number of rows matching specified criterion.
• AVG() function returns average value of a numeric column.
• SUM() function returns total sum of a numeric column.
Syntax:
SELECT COUNT(column_name) FROM table_name WHERE condition;
SELECT AVG(column_name) FROM table_name WHERE condition;
SELECT SUM(column_name) FROM table_name WHERE condition;

Examples:
SELECT COUNT(ProductID) FROM Products;
SELECT AVG(Price) FROM Products;`,
  },
  {
    pageNumber: 60,
    title: "SQL SUM() Function Details & NULL Values",
    text: `Structured Query Language (SQL) (Page 8)
Note: NULL values are ignored by aggregate functions.

SUM() Example:
The following SQL statement finds the sum of the "Quantity" fields in the "OrderDetails" table:
SELECT SUM(Quantity)
FROM OrderDetails;

Note: NULL values are ignored in the calculation.
End of DBMS Lecture Notes (60 Pages Complete).`,
  },
];

function sanitizeForPdf(str: string): string {
  return str
    .replace(/[✓✔]/g, "-")
    .replace(/[•●]/g, "*")
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/=>/g, "->")
    .replace(/[^\x20-\x7E\t\n\r]/g, "");
}

/**
 * Creates data/source/book.pdf with all 60 pages
 */
async function buildPdf() {
  const targetDir = path.join(process.cwd(), "data", "source");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (const p of DBMS_PAGES) {
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();

    // Header bar
    page.drawText(sanitizeForPdf(`Database Management Systems - Page ${p.pageNumber}`), {
      x: 40,
      y: height - 40,
      size: 10,
      font: fontBold,
      color: rgb(0.15, 0.35, 0.8),
    });

    // Title
    page.drawText(sanitizeForPdf(p.title.slice(0, 70)), {
      x: 40,
      y: height - 65,
      size: 14,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Content lines
    const lines = p.text.split("\n");
    let y = height - 95;
    for (const line of lines) {
      if (y < 40) break;
      const clean = sanitizeForPdf(line.slice(0, 95));
      page.drawText(clean, {
        x: 40,
        y,
        size: 9,
        font: line.startsWith("•") || line.startsWith("Lecture") || line.startsWith("UNIT") ? fontBold : font,
        color: rgb(0.15, 0.15, 0.15),
      });
      y -= 14;
    }
  }

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(targetDir, "book.pdf");
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`✅ Successfully generated 60-page PDF at: ${outputPath} (${pdfBytes.length} bytes)`);
}

buildPdf().catch((e) => {
  console.error("Failed to build PDF:", e);
  process.exit(1);
});

# Easy OH

Roles:
1. TA
2. Instructor


TA is able to:
1. Propose date change


Instructor/Head TA is able to:
1. Initially, add office hours for all TAs.
2. Approve/reject date change with message
3. Change his/her own office hour

DB Design:
1. Users 
   1. userID: string
   2. role: {"ta", "instructor"}
   3. email: string
   4. password: string
2. Office Hour Change
   1. messageId: string
   2. email: string
   3. startTime: datetime
   4. endTime: datetime
   5. isRecurring: boolean

Whenever an email is added to user as instructor, it should also add to authorized_emails!
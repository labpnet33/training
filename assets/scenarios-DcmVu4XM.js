var e=[{title:{en:`Bob is rejected with the right password`,hi:`Bob sahi password ke saath reject hota hai`},ticket:{en:`Alice connects fine. Bob (Department Contractor) is rejected although his password was just reset and verified. Lab output from the Access Tracker is below.`,hi:`Alice theek connect hoti hai. Bob (Department Contractor) reject hota hai, jabki uska password abhi reset aur verify hua hai. Neeche Access Tracker ka lab output hai.`},out:`Summary
-------
  Login Status              : REJECT
  Username                  : bob
  Service                   : Wired 802.1X
  Authentication Source     : [Local User Repository]
  Roles                     : [User Authenticated]
  Enforcement Profiles      : [Deny Access Profile]
  Enforcement Policy        : EPOL-WIRED

Alerts
------
  Error Code                : 9010
  Error Message             : No enforcement rule matched (default profile [Deny Access Profile])`,q:{en:`What is the correct fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Reset Bob's password again`,hi:`Bob ka password dobara reset karo`},{en:`Change the policy default to the employee profile`,hi:`Policy default ko employee profile par karo`},{en:`Add the role CONTRACTOR with a role mapping rule on Department, an EP-CONTRACTOR profile and a policy rule on Tips:Role CONTRACTOR`,hi:`Role CONTRACTOR, Department par role mapping rule, EP-CONTRACTOR profile aur Tips:Role CONTRACTOR par policy rule jodo`},{en:`Register the switch as a network device again`,hi:`Switch ko network device ke roop mein dobara register karo`}],a:2,w:{en:`Authentication passed (no 215, 216 or 217) and the Roles line shows only [User Authenticated], so role mapping gave Bob no role and the policy fell to default deny. The fix is a role, a mapping rule, a profile and a policy rule. Loosening the default would admit unknown users.`,hi:`Authentication pass hui (215, 216 ya 217 nahi) aur Roles line mein sirf [User Authenticated] hai, to role mapping ne Bob ko koi role nahi diya aur policy default deny par gayi. Fix role, mapping rule, profile aur policy rule hai. Default dheela karne se unknown users andar aa jaayenge.`}},{title:{en:`A test service handles every login`,hi:`Ek test service har login handle karti hai`},ticket:{en:`After a pilot every laptop is in the GUEST role in VLAN 40. Users and roles were not changed. You read the service list and the latest record.`,hi:`Pilot ke baad har laptop VLAN 40 ke GUEST role mein hai. Users aur roles nahi badle. Aapne service list aur latest record padha.`},out:`Configuration > Services (evaluated in this order; first match wins)
#  Name                  Status   Rules
-  --------------------  -------  ------------------------------------------------
1  Wired Allow-All Test  Enabled  Radius:IETF:NAS-Port-Type EQUALS 15 ; Radius:IETF:Service-Type BELONGS_TO 1,2,8
2  Wired 802.1X          Enabled  Radius:IETF:NAS-Port-Type EQUALS 15 ; Radius:IETF:Service-Type BELONGS_TO 1,2,8

Summary
  Username                  : alice
  Service                   : Wired Allow-All Test
  Enforcement Profiles      : EP-GUEST`,q:{en:`Which action fixes the cause?`,hi:`Kaunsa action cause fix karta hai?`},o:[{en:`Move Wired 802.1X to position 1 or disable the test service, then make the clients authenticate again`,hi:`Wired 802.1X ko position 1 par lao ya test service disable karo, phir clients ko dobara authenticate karwao`},{en:`Create role GUEST on ClearPass`,hi:`ClearPass par role GUEST banao`},{en:`Change NAS-Port-Type to 19 in Wired 802.1X`,hi:`Wired 802.1X mein NAS-Port-Type 19 karo`},{en:`Remove VLAN 40 from the switch`,hi:`Switch se VLAN 40 hata do`}],a:0,w:{en:`Both services have identical classification rules, and first match wins, so the test service handles everything. Fix the order or disable it, then bounce the ports because live sessions keep their old result. NAS-Port-Type 19 is wireless and would break wired matching.`,hi:`Dono services ke classification rules identical hain aur first match jeetta hai, isliye test service sab handle karti hai. Order theek karo ya use disable karo, phir ports bounce karo kyunki live sessions purana result rakhte hain. NAS-Port-Type 19 wireless hai aur wired matching tod dega.`}},{title:{en:`Right roles, wrong profile`,hi:`Sahi roles, galat profile`},ticket:{en:`Every authenticated user lands in the GUEST role. The service and role mapping were audited and are correct. You show the policy.`,hi:`Har authenticated user GUEST role mein land karta hai. Service aur role mapping audit ho chuki aur sahi hain. Aapne policy show ki.`},out:`Policy: EPOL-WIRED   Evaluation: select first match   Default profile: [Deny Access Profile]
  1. if Tips:Role EQUALS [User Authenticated] then EP-GUEST
  2. if Tips:Role EQUALS ENGINEER then EP-EMPLOYEE
  3. if Tips:Role EQUALS CONTRACTOR then EP-CONTRACTOR`,q:{en:`What is wrong and how do you repair it?`,hi:`Kya galat hai aur repair kaise karoge?`},o:[{en:`The algorithm must be all matches; change it and keep the order`,hi:`Algorithm all matches hona chahiye; use badlo aur order rakho`},{en:`Delete rules 2 and 3 because they are never used`,hi:`Rules 2 aur 3 delete karo kyunki woh kabhi use nahi hote`},{en:`Change the default profile to EP-EMPLOYEE`,hi:`Default profile ko EP-EMPLOYEE karo`},{en:`Remove the catch-all rule 1 from the front, then bounce the client ports`,hi:`Catch-all rule 1 ko aage se hatao, phir client ports bounce karo`}],a:3,w:{en:`Rule 1 is true for every authenticated user and first match stops there. Removing it (rule remove 1) makes ENGINEER and CONTRACTOR the first rules. Switching to all matches would give users GUEST plus the right profile and conflicting attributes.`,hi:`Rule 1 har authenticated user ke liye true hai aur first match wahin ruk jaata hai. Use hatane (rule remove 1) se ENGINEER aur CONTRACTOR pehle rules ban jaate hain. All matches par jaane se users ko GUEST aur sahi profile dono milte aur attributes conflict karte.`}},{title:{en:`Nothing matches at the branch`,hi:`Branch par kuch match nahi hota`},ticket:{en:`A branch switch was added and nobody can log in. The service was cloned from the wireless service. The tracker shows this.`,hi:`Branch ka switch jodha gaya aur koi login nahi kar paata. Service wireless service se clone hui thi. Tracker yeh dikhata hai.`},out:`Summary
  Login Status              : REJECT
  Service                   : (none)

Alerts
------
  Error Code                : 9002
  Error Message             : Failed to classify request to service

Input (excerpt)
  Radius:IETF:NAS-Port-Type = Ethernet (15)
  Radius:IETF:Service-Type  = Framed-User (2)

Service rules (match ALL)
  1. Radius:IETF:NAS-Port-Type EQUALS 19`,q:{en:`What is the cause?`,hi:`Cause kya hai?`},o:[{en:`The user accounts are disabled`,hi:`User accounts disabled hain`},{en:`The enforcement policy default is deny`,hi:`Enforcement policy ka default deny hai`},{en:`The switch role has the wrong VLAN`,hi:`Switch role mein galat VLAN hai`},{en:`The service rule still requires NAS-Port-Type 19, but wired requests carry 15`,hi:`Service rule ab bhi NAS-Port-Type 19 maangta hai, jabki wired requests mein 15 aata hai`}],a:3,w:{en:`Error 9002 means no service matched. The Input tab shows NAS-Port-Type 15 while the rule says 19. Correct the rule to 15 and keep Service-Type 1, 2 or 8. Accounts, policy and switch roles are not reached yet.`,hi:`Error 9002 ka matlab koi service match nahi hui. Input tab NAS-Port-Type 15 dikhata hai jabki rule 19 kehta hai. Rule ko 15 karo aur Service-Type 1, 2 ya 8 rakho. Accounts, policy aur switch roles abhi tak pahunche hi nahi.`}},{title:{en:`Accepted, but the role is not applied`,hi:`Accepted, lekin role apply nahi hua`},ticket:{en:`Alice is accepted. The switch keeps the port unauthorized and logs that the returned role is unknown. Compare the two outputs.`,hi:`Alice accept hoti hai. Switch port ko unauthorized rakhta hai aur log karta hai ki return hua role unknown hai. Dono outputs compare karo.`},out:`ClearPass Output tab
  Enforcement Profiles      : EP-EMPLOYEE
  Radius:Aruba:Aruba-User-Role = Employee

ACCESS# show port-access role
Role        VLAN
----------  ----
EMPLOYEE    10
CONTRACTOR  20`,q:{en:`Which object do you correct?`,hi:`Kaunsa object theek karoge?`},o:[{en:`Create a second role called Employee on the switch`,hi:`Switch par Employee naam ka doosra role banao`},{en:`Set the Aruba-User-Role value in EP-EMPLOYEE to EMPLOYEE`,hi:`EP-EMPLOYEE mein Aruba-User-Role value EMPLOYEE karo`},{en:`Add a role mapping rule for Employee`,hi:`Employee ke liye role mapping rule jodo`},{en:`Disable the service`,hi:`Service disable karo`}],a:1,w:{en:`Role names are compared exactly, upper and lower case included. The switch role is EMPLOYEE and the profile returns Employee. Fix the profile so it matches the existing switch role instead of creating duplicate roles.`,hi:`Role names case samet exactly compare hote hain. Switch role EMPLOYEE hai aur profile Employee return karta hai. Profile ko existing switch role se match karao, duplicate roles banane ke bajaye.`}},{title:{en:`Two spellings of one department`,hi:`Ek department ki do spellings`},ticket:{en:`Newly imported contractors authenticate but are denied. The role mapping rule is correct for the older accounts. Compare the evidence.`,hi:`Naye import hue contractors authenticate hote hain lekin deny hote hain. Role mapping rule purane accounts ke liye sahi hai. Evidence compare karo.`},out:`Configuration > Identity > Local Users
Name    Status   Attributes
carol   enabled  Department=Contractors
bob     enabled  Department=Contractor

Role mapping: RM-WIRED   Rules evaluation: select first match   Default role: (none)
  1. if Local:Department EQUALS Engineering then ENGINEER
  2. if Local:Department EQUALS Contractor then CONTRACTOR

Summary (carol)
  Roles                     : [User Authenticated]
  Enforcement Profiles      : [Deny Access Profile]`,q:{en:`What is the best fix?`,hi:`Sabse achha fix kya hai?`},o:[{en:`Add a catch-all rule on [User Authenticated] to the policy`,hi:`Policy mein [User Authenticated] par catch-all rule jodo`},{en:`Correct the imported attribute to Contractor (or add one mapping rule for Contractors) and let carol authenticate again`,hi:`Import hue attribute ko Contractor karo (ya Contractors ke liye ek mapping rule jodo) aur carol ko dobara authenticate hone do`},{en:`Change the service to MAC authentication`,hi:`Service ko MAC authentication par karo`},{en:`Enable Allow All MAC AUTH`,hi:`Allow All MAC AUTH enable karo`}],a:1,w:{en:`EQUALS compares text exactly: Contractors is not Contractor, so no role is assigned. Fix the data or add a rule; do not loosen enforcement with a catch-all, which would also admit everyone else.`,hi:`EQUALS text ko exactly compare karta hai: Contractors aur Contractor alag hain, isliye role assign nahi hota. Data theek karo ya rule jodo; catch-all se enforcement dheela mat karo, isse baaki sab bhi andar aa jaate.`}},{title:{en:`The policy is fixed but nobody moved`,hi:`Policy fix ho gayi lekin koi nahi hila`},ticket:{en:`You removed the catch-all rule and the policy now looks right. Ten minutes later the connected laptops are still in GUEST. The switch shows this.`,hi:`Aapne catch-all rule hata diya aur policy ab sahi dikhti hai. Das minute baad bhi connected laptops GUEST mein hain. Switch yeh dikhata hai.`},out:`ACCESS# show port-access clients
Port    MAC                Method  Role    VLAN  Status
1/1/3   00:50:2f:e9:9a:01  dot1x   GUEST   40    Authorized
1/1/4   00:50:2f:e9:9a:02  dot1x   GUEST   40    Authorized

Policy: EPOL-WIRED   Evaluation: select first match   Default profile: [Deny Access Profile]
  1. if Tips:Role EQUALS ENGINEER then EP-EMPLOYEE
  2. if Tips:Role EQUALS CONTRACTOR then EP-CONTRACTOR`,q:{en:`Why are the clients still in GUEST, and what next?`,hi:`Clients abhi bhi GUEST mein kyun hain, aur ab kya?`},o:[{en:`The default profile must be changed first`,hi:`Pehle default profile badalna hoga`},{en:`The Aruba-User-Role is case-sensitive, so the policy cannot work`,hi:`Aruba-User-Role case-sensitive hai, isliye policy kaam nahi kar sakti`},{en:`The service is disabled`,hi:`Service disabled hai`},{en:`Enforcement runs at authentication; the sessions are old, so bounce the ports (shutdown, no shutdown), reauthorize or send a Disconnect`,hi:`Enforcement authentication par chalta hai; sessions purane hain, isliye ports bounce karo (shutdown, no shutdown), reauthorize karo ya Disconnect bhejo`}],a:3,w:{en:`The policy edit is correct but live sessions keep the profile they received at login. A new authentication triggers a new evaluation. Bouncing 1/1/3-1/1/4 is the lab way; CoA needs dyn-authorization on both sides.`,hi:`Policy edit sahi hai lekin live sessions login par mila profile rakhte hain. Nayi authentication nayi evaluation chalati hai. 1/1/3-1/1/4 bounce karna lab ka tareeka hai; CoA ko dono side dyn-authorization chahiye.`}}];export{e as default};
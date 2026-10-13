var e=(e,t)=>({en:e,hi:t}),t=[{title:e(`Pune sign-in errors on Monday`,`Monday ko Pune sign-in errors`),ticket:e(`Ticket 320030: all Pune users get a sign-in error since 09:00. Chennai client connector users are fine. What is the root cause?`,`Ticket 320030: saare Pune users ko 09:00 se sign-in error aa raha hai. Chennai client connector users theek hain. Root cause kya hai?`),out:`Identity > SAML
Enabled ............ yes
Entity ID .......... sahyadri-sp   match
ACS URL ............ acs-sahyadri   match
Certificate ........ 0 days left (expired)
Clock .............. in sync
Health ............. PROBLEM

Policy tester  user: ravi  host: news.example  location: pun
Identity ........... FAILED: signature check   result: 401`,q:e(`What should you do?`,`Aap kya karoge?`),o:[e(`Rebuild the IPsec tunnel for Pune`,`Pune ka IPsec tunnel dobara banao`),e(`Turn authentication off for Pune`,`Pune ke liye authentication off karo`),e(`Load the renewed signing certificate and retest`,`Renewed signing certificate load karo aur dobara test karo`),e(`Delete all Pune users`,`Saare Pune users delete karo`)],a:2,w:e(`Entity IDs, ACS and clock are fine; the certificate has 0 days left, so every signature check fails. Turning authentication off would hide the problem and break group rules.`,`Entity IDs, ACS aur clock theek hain; certificate 0 days left hai, isliye har signature check fail hota hai. Authentication off karne se problem chhup jaayegi aur group rules toot jaayenge.`)},{title:e(`Social rule open in Jaipur`,`Jaipur mein social rule open`),ticket:e(`Ticket 320080: the rule "Block social for Sales" works in Pune but kabir in Jaipur can open social.example.`,`Ticket 320080: rule "Block social for Sales" Pune mein chalta hai lekin Jaipur mein kabir social.example khol leta hai.`),out:`Locations > jpr
Method ............. PAC
Authentication ..... off

Policy tester  host: social.example  location: jpr
Identity ........... unknown (authentication off)
URL rule ........... Default allow
Result ............. 200 allowed`,q:e(`Which fix is correct?`,`Kaun sa fix sahi hai?`),o:[e(`Turn authentication on for the Jaipur location`,`Jaipur location par authentication on karo`),e(`Rewrite the rule for Everyone`,`Rule ko Everyone ke liye dobara likho`),e(`Renew the SAML certificate`,`SAML certificate renew karo`),e(`Move the rule below the default allow`,`Rule ko default allow ke neeche le jao`)],a:0,w:e(`The user is unknown at Jaipur, so the Sales rule cannot match. The rule is fine; the identity input is missing.`,`Jaipur par user unknown hai, to Sales rule match nahi kar sakta. Rule theek hai; identity input missing hai.`)},{title:e(`New HR hire, no access`,`Naya HR hire, access nahi`),ticket:e(`Ticket 321030: a new HR hire signs in fine but cannot open the HR portal.`,`Ticket 321030: naya HR hire sign in kar leta hai lekin HR portal nahi khol pa raha.`),out:`Identity > SCIM
Enabled ............ yes
Token .............. valid
Last sync .......... not synced

Users        enabled  provisioned  groups
ravi         yes      yes          Finance
newhire      yes      no           (none)

Alerts: SCIM not syncing`,q:e(`What is the root cause?`,`Root cause kya hai?`),o:[e(`The SAML certificate expired`,`SAML certificate expire ho gaya`),e(`The user is disabled`,`User disabled hai`),e(`The Pune tunnel is down`,`Pune tunnel down hai`),e(`SCIM has not provisioned the user, so there are no groups`,`SCIM ne user provision nahi kiya, to groups nahi hain`)],a:3,w:e(`Sign-in works (SAML fine) and the user is enabled, but provisioned is no and groups are empty, so group-based access has nothing to match.`,`Sign-in chal raha hai (SAML theek) aur user enabled hai, lekin provisioned no hai aur groups empty hain, to group-based access ke paas match karne ko kuch nahi.`)},{title:e(`Offboard a contractor`,`Contractor offboard karo`),ticket:e(`Ticket 321040: contractor rohit has left. Make sure web and private access stop and prove it.`,`Ticket 321040: contractor rohit chala gaya. Web aur private access band karo aur prove karo.`),out:`Users        enabled  provisioned  groups
rohit        yes      yes          Contractors

Policy tester  user: rohit  host: partners.example
Identity ........... rohit (Contractors)
Result ............. 200 allowed`,q:e(`What is the best action and proof?`,`Sabse achha action aur proof kya hai?`),o:[e(`Delete the Contractors group`,`Contractors group delete karo`),e(`Disable the user, then show 401 on web and a failed private test`,`User disable karo, phir web par 401 aur failed private test dikhao`),e(`Turn authentication off at all locations`,`Saare locations par authentication off karo`),e(`Ask rohit to sign out`,`Rohit se sign out karne ko kaho`)],a:1,w:e(`Disabling stops sign-in itself. Evidence of both paths closes the ticket. Deleting the group would affect other contractors; asking the leaver to log out is not control.`,`Disable karne se sign-in hi ruk jaata hai. Dono paths ka evidence ticket close karta hai. Group delete karne se baaki contractors par asar padega; leaver se logout kehna control nahi hai.`)},{title:e(`ACS URL mismatch after a directory change`,`Directory change ke baad ACS URL mismatch`),ticket:e(`Lab zs-id-1: after a directory update nobody can sign in. Find the mismatch.`,`Lab zs-id-1: directory update ke baad koi sign in nahi kar pa raha. Mismatch dhundo.`),out:`Identity > SAML
Entity ID .......... sahyadri-sp     IdP side: sahyadri-sp     match
IdP entity ID ...... sahyadri-idp    match
ACS URL ............ acs-sahyadri   IdP side: acs-sahyadri-v2   MISMATCH
Certificate ........ 212 days left
Clock .............. in sync
Health ............. PROBLEM`,q:e(`Which single change makes the health line healthy?`,`Kaun sa ek change health line ko healthy karega?`),o:[e(`Renew the certificate`,`Certificate renew karo`),e(`Change the entity ID`,`Entity ID badlo`),e(`Make the portal ACS URL equal the directory value and activate`,`Portal ka ACS URL directory value ke barabar karo aur activate karo`),e(`Reset the clock`,`Clock reset karo`)],a:2,w:e(`Only the ACS URL differs. Certificate days and clock are fine and the entity IDs already match.`,`Sirf ACS URL alag hai. Certificate days aur clock theek hain aur entity IDs pehle se match karte hain.`)},{title:e(`Valid users rejected, clock off`,`Valid users reject, clock off`),ticket:e(`Ticket: sign-ins fail intermittently; all values look right. What does the page show?`,`Ticket: sign-ins kabhi kabhi fail hote hain; saare values sahi lagte hain. Page kya dikhata hai?`),out:`Identity > SAML
Entity ID .......... match
ACS URL ............ match
Certificate ........ 180 days left
Clock .............. NOT in sync (service ahead of directory)
Health ............. PROBLEM: assertion outside validity window`,q:e(`What is the proper fix?`,`Sahi fix kya hai?`),o:[e(`Correct the time source so both clocks agree`,`Time source theek karo taaki dono clocks agree karein`),e(`Widen the assertion validity as far as possible`,`Assertion validity jitni ho sake badha do`),e(`Switch SCIM off`,`SCIM off karo`),e(`Replace the certificate`,`Certificate replace karo`)],a:0,w:e(`The assertion is valid but judged against a wrong clock. Fix the time source; widening hides the drift and weakens the check.`,`Assertion valid hai lekin galat clock se judge ho raha hai. Time source theek karo; window badhane se drift chhupta hai aur check kamzor hota hai.`)}];export{t as default};
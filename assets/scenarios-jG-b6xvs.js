var e=[{title:{en:`Statics missing on the core`,hi:`Core par statics gayab`},ticket:{en:`R1 (Chennai edge) has four static routes to the partner and OSPF Full with core R2. R2 shows only R1's loopback. Find the reason.`,hi:`R1 (Chennai edge) par partner ke chaar static routes hain aur core R2 ke saath OSPF Full hai. R2 par sirf R1 ka loopback dikhta hai. Wajah dhoondo.`},out:`lab@R1> show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.44.12.2       ge-0/0/0.0             Full            10.44.255.2      128    40

lab@R1> show route protocol static
inet.0: 11 destinations, 11 routes (11 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

172.20.1.0/24      *[Static/5] 00:00:30
                    >  to 10.44.90.2 via ge-0/0/1.0
172.20.2.0/24      *[Static/5] 00:00:30
                    >  to 10.44.90.2 via ge-0/0/1.0
172.20.8.0/22      *[Static/5] 00:00:30
                    >  to 10.44.90.2 via ge-0/0/1.0
192.168.99.0/24    *[Static/5] 00:00:30
                    >  to 10.44.90.2 via ge-0/0/1.0

lab@R1> show configuration protocols ospf
area 0.0.0.0 {
    interface ge-0/0/0.0;
    interface lo0.0 {
        passive;
    }
}`,q:{en:`Why does R2 not learn the static routes?`,hi:`R2 static routes kyun nahi seekhta?`},o:[{en:`The OSPF neighbour is not Full`,hi:`OSPF neighbour Full nahi hai`},{en:`The statics must have preference 10 to enter OSPF`,hi:`Statics ko OSPF mein jaane ke liye preference 10 chahiye`},{en:`No export policy is applied to OSPF, and the OSPF default export rejects non-OSPF routes`,hi:`OSPF par koi export policy applied nahi hai, aur OSPF ka default export non-OSPF routes reject karta hai`},{en:`R2 needs an import policy for static routes`,hi:`R2 ko static routes ke liye import policy chahiye`}],a:2,w:{en:`The neighbour is Full and the statics are active. Without an export policy accepting them, the default OSPF export (reject) keeps them off the network.`,hi:`Neighbour Full hai aur statics active hain. Unhe accept karne wali export policy ke bina default OSPF export (reject) unhe network se bahar rakhta hai.`}},{title:{en:`Analytics subnet black hole`,hi:`Analytics subnet black hole`},ticket:{en:`10.60.200.0/24 is a valid static on the DC router but is missing on campus. 10.60.5.0/24 works. Read the policy.`,hi:`10.60.200.0/24 DC router par valid static hai lekin campus par missing hai. 10.60.5.0/24 chalta hai. Policy padho.`},out:`lab@R1-DC> show policy DC-OUT
Policy DC-OUT:
    Term DC:
        from proto Static
        from     10.60.0.0/16 orlonger
        from     10.60.128.0/17 exact
        then     accept
    Term LAST:
        then     reject

lab@R1-DC> test policy DC-OUT 10.60.0.0/16
10.60.5.0/24       *[Static/5] 00:20:15
Policy DC-OUT: 1 prefix accepted, 1 prefix rejected`,q:{en:`What should you do?`,hi:`Kya karna chahiye?`},o:[{en:`Remove the 10.60.128.0/17 exact entry, because the longest covering route-filter decides for 10.60.200.0/24`,hi:`10.60.128.0/17 exact entry hatao, kyunki 10.60.200.0/24 ke liye sabse lamba covering route-filter decide karta hai`},{en:`Delete the static route and recreate it`,hi:`Static route delete karke dobara banao`},{en:`Change orlonger to exact on the /16`,hi:`/16 par orlonger ko exact karo`},{en:`Add a second term with route-filter 10.60.200.0/24 upto /32 after LAST`,hi:`LAST ke baad route-filter 10.60.200.0/24 upto /32 wala doosra term jodo`}],a:0,w:{en:`10.60.200.0/24 is covered by the /17, whose exact type rejects a /24. The /16 orlonger is never used. A term placed after LAST would never run.`,hi:`10.60.200.0/24 /17 se cover hota hai, jiska exact type /24 ko reject karta hai. /16 orlonger kabhi use nahi hota. LAST ke baad rakha term kabhi nahi chalega.`}},{title:{en:`Summary and its specifics`,hi:`Summary aur uske specifics`},ticket:{en:`Only the 10.70.0.0/16 summary should reach campus, but R2 shows more. Decide the fix.`,hi:`Campus tak sirf 10.70.0.0/16 summary pahunchni chahiye, lekin R2 par zyada dikhta hai. Fix decide karo.`},out:`lab@R2> show route protocol ospf | match 10.70
10.70.0.0/16       *[OSPF/150] 00:00:30, metric 0
10.70.1.0/24       *[OSPF/150] 00:00:30, metric 0
10.70.2.0/24       *[OSPF/150] 00:00:30, metric 0

lab@R1-DC> show policy DC-OUT
    Term LABS:
        from proto Static
        from     10.70.0.0/16 orlonger
        then     accept`,q:{en:`Which change gives exactly one route on R2?`,hi:`Kaunsa change R2 par exactly ek route dega?`},o:[{en:`Delete the two /24 static routes on R1`,hi:`R1 par dono /24 static routes delete karo`},{en:`Change the match type to longer`,hi:`Match type ko longer karo`},{en:`Apply the policy as import on OSPF`,hi:`Policy ko OSPF par import ke roop mein apply karo`},{en:`Replace orlonger with exact for 10.70.0.0/16`,hi:`10.70.0.0/16 ke liye orlonger ki jagah exact lagao`}],a:3,w:{en:`exact accepts only the /16. longer would accept only the /24s. Deleting statics breaks local reachability, and import does not control what R1 advertises.`,hi:`exact sirf /16 accept karta hai. longer sirf /24s accept karta. Statics delete karne se local reachability toot jaati hai, aur import R1 ki advertising control nahi karta.`}},{title:{en:`The block that never ran`,hi:`Jo block kabhi chala hi nahi`},ticket:{en:`Policy NO-MGMT rejects 192.168.99.0/24, was applied last week, but the audit still finds the route on the partner router.`,hi:`Policy NO-MGMT 192.168.99.0/24 reject karti hai, pichle hafte apply hui, lekin audit ko phir bhi route partner router par mila.`},out:`lab@R1> show configuration protocols ospf | display set
set protocols ospf export STATICS
set protocols ospf export NO-MGMT
set protocols ospf area 0.0.0.0 interface ge-0/0/0.0

lab@R1> show policy STATICS
Policy STATICS:
    Term ALL:
        from proto Static
        then     accept`,q:{en:`Why is the route still advertised?`,hi:`Route phir bhi advertise kyun ho raha hai?`},o:[{en:`NO-MGMT is invalid and was ignored by commit`,hi:`NO-MGMT invalid hai aur commit ne use ignore kiya`},{en:`STATICS runs first and accepts the route, so NO-MGMT never sees it`,hi:`STATICS pehle chalti hai aur route accept kar leti hai, isliye NO-MGMT use dekhti hi nahi`},{en:`reject can never override accept in a different policy`,hi:`reject kabhi doosri policy ke accept ko override nahi kar sakta`},{en:`The route needs the tag 300 first`,hi:`Route ko pehle tag 300 chahiye`}],a:1,w:{en:`The chain is [ STATICS NO-MGMT ]. First terminating action wins. Delete the export list and set it as [ NO-MGMT STATICS]. (Option 3 is wrong: order decides, not the action type.)`,hi:`Chain [ STATICS NO-MGMT ] hai. Pehla terminating action jeet-ta hai. Export list delete karke [ NO-MGMT STATICS ] set karo. (Option 3 galat hai: order decide karta hai, action type nahi.)`}},{title:{en:`Tag-only policy`,hi:`Sirf tag wali policy`},ticket:{en:`You wrote SET-TAG (then tag 300) and applied it alone as the OSPF export. test policy said everything is accepted, yet R2 learned no statics.`,hi:`Aapne SET-TAG (then tag 300) likhi aur akeli OSPF export ke roop mein lagayi. test policy ne kaha sab accepted hai, phir bhi R2 ne koi static nahi seekha.`},out:`lab@R1> test policy SET-TAG 172.21.0.0/16
172.21.1.0/24      *[Static/5] 01:10:00
172.21.2.0/24      *[Static/5] 01:10:00
Policy SET-TAG: 2 prefix accepted, 0 prefix rejected

lab@R1> show configuration protocols ospf | display set | match export
set protocols ospf export SET-TAG`,q:{en:`What explains the difference?`,hi:`Is farak ki wajah kya hai?`},o:[{en:`Tags cannot be exported in OSPF`,hi:`Tags OSPF mein export nahi ho sakte`},{en:`test policy is wrong about the table contents`,hi:`test policy table contents ke baare mein galat hai`},{en:`test policy assumes accept for undecided routes, but the OSPF default export rejects them`,hi:`test policy undecided routes ko accept maanta hai, lekin OSPF default export unhe reject karta hai`},{en:`The metric is missing`,hi:`Metric missing hai`}],a:2,w:{en:`SET-TAG makes no accept or reject decision. Put it before a policy that accepts statics, such as [ SET-TAG STATICS ].`,hi:`SET-TAG accept ya reject ka decision nahi leti. Use statics accept karne wali policy se pehle rakho, jaise [ SET-TAG STATICS ].`}},{title:{en:`What does R2 see?`,hi:`R2 ko kya dikhta hai?`},ticket:{en:`After applying PARTNER-OUT (static, 172.20.0.0/16 orlonger, metric 20, accept) to OSPF export, check R2's table for the vendor network 192.168.99.0/24.`,hi:`PARTNER-OUT (static, 172.20.0.0/16 orlonger, metric 20, accept) ko OSPF export par lagane ke baad R2 ki table mein vendor network 192.168.99.0/24 check karo.`},out:`lab@R2> show route protocol ospf
inet.0: 8 destinations, 8 routes (8 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

10.44.255.1/32     *[OSPF/10] 00:01:10, metric 1
                    >  to 10.44.12.1 via ge-0/0/0.0
172.20.1.0/24      *[OSPF/150] 00:00:40, metric 20
                    >  to 10.44.12.1 via ge-0/0/0.0
172.20.2.0/24      *[OSPF/150] 00:00:40, metric 20
                    >  to 10.44.12.1 via ge-0/0/0.0
172.20.8.0/22      *[OSPF/150] 00:00:40, metric 20
                    >  to 10.44.12.1 via ge-0/0/0.0
224.0.0.5/32       *[OSPF/10] 00:01:10, metric 1
                       MultiRecv

lab@R2> show route 192.168.99.0/24
lab@R2>`,q:{en:`Why is 192.168.99.0/24 absent, and is that correct?`,hi:`192.168.99.0/24 absent kyun hai, aur kya yeh sahi hai?`},o:[{en:`It is a bug; the static must be re-added`,hi:`Yeh bug hai; static dobara add karna hoga`},{en:`It is correct: no term matches it, so the OSPF default export rejects it`,hi:`Yeh sahi hai: koi term use match nahi karta, isliye OSPF default export use reject karta hai`},{en:`It is hidden by metric 20`,hi:`Metric 20 ki wajah se hidden hai`},{en:`OSPF cannot export /24 routes`,hi:`OSPF /24 routes export nahi kar sakta`}],a:1,w:{en:`192.168.99.0/24 is outside 172.20.0.0/16. Nothing decides, so the default (reject) applies. This is the intended result.`,hi:`192.168.99.0/24 172.20.0.0/16 ke bahar hai. Koi decide nahi karta, isliye default (reject) lagta hai. Yahi intended result hai.`}},{title:{en:`Which route matches?`,hi:`Kaunsa route match hota hai?`},ticket:{en:`A term contains: route-filter 10.90.0.0/16 upto /20. The router has several statics. Predict which ones the term matches.`,hi:`Ek term mein hai: route-filter 10.90.0.0/16 upto /20. Router par kai statics hain. Predict karo term kaunse match karta hai.`},out:`lab@R1> show route protocol static terse
A Destination        P Prf   Metric 1   Metric 2  Next hop
* 10.90.0.0/16       S   5                       Discard
* 10.90.16.0/20      S   5                       >10.99.0.2
* 10.90.16.0/24      S   5                       >10.99.0.2
* 10.91.0.0/16       S   5                       >10.99.0.2`,q:{en:`Which prefixes does the term match?`,hi:`Term kaunse prefixes match karta hai?`},o:[{en:`Only 10.90.0.0/16`,hi:`Sirf 10.90.0.0/16`},{en:`10.90.0.0/16 and 10.90.16.0/20 only`,hi:`Sirf 10.90.0.0/16 aur 10.90.16.0/20`},{en:`10.90.0.0/16, 10.90.16.0/20 and 10.90.16.0/24`,hi:`10.90.0.0/16, 10.90.16.0/20 aur 10.90.16.0/24`},{en:`All four routes`,hi:`Chaaron routes`}],a:1,w:{en:`upto /20 matches the /16 itself and more specifics up to length /20. The /24 is too long and 10.91.0.0/16 is outside the prefix.`,hi:`upto /20 /16 khud aur /20 length tak ke specifics match karta hai. /24 bahut lamba hai aur 10.91.0.0/16 prefix ke bahar hai.`}},{title:{en:`Verify the chain`,hi:`Chain verify karo`},ticket:{en:`The chain [ NO-MGMT SET-TAG STATICS ] is applied. Predict the state of 172.21.1.0/24 on R2 and compare with the output.`,hi:`Chain [ NO-MGMT SET-TAG STATICS ] applied hai. R2 par 172.21.1.0/24 ki state predict karo aur output se compare karo.`},out:`lab@R2> show route 172.21.1.0/24 detail

172.21.1.0/24 (1 entry, 1 announced)
        *OSPF   Preference: 150
                Source: 10.52.12.1
                State: <Active Int Ext>
                Age: 2:30      Metric: 0
                Tag: 300`,q:{en:`Which statement about this route is true?`,hi:`Is route ke baare mein kaunsa statement sahi hai?`},o:[{en:`STATICS set tag 300 and then accepted`,hi:`STATICS ne tag 300 set kiya aur phir accept kiya`},{en:`NO-MGMT rejected it but the tag was still advertised`,hi:`NO-MGMT ne reject kiya lekin tag phir bhi advertise hua`},{en:`It is an OSPF internal route learned from R1`,hi:`Yeh R1 se seekha OSPF internal route hai`},{en:`SET-TAG added tag 300 without deciding, then STATICS accepted the route`,hi:`SET-TAG ne bina decide kiye tag 300 lagaya, phir STATICS ne route accept kiya`}],a:3,w:{en:`Preference 150 and State Ext show an OSPF external. The tag comes from SET-TAG (modifying action only); STATICS made the accept decision.`,hi:`Preference 150 aur State Ext OSPF external dikhate hain. Tag SET-TAG se aaya (sirf modifying action); accept ka decision STATICS ne liya.`}}];export{e as default};
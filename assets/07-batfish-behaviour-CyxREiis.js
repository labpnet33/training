var e={id:`batfish-behaviour`,h:{en:`Behaviour questions: BGP sessions, routes and traceroute`,hi:`Behaviour questions: BGP sessions, routes aur traceroute`},body:{en:`
<p>Hygiene asks "is the map correct?". Behaviour asks "can I actually drive from A to B?". Batfish does not only read your configs; it computes what the routing protocols would do with them. So you can ask whether BGP sessions come up, which routes each router would hold and how a packet would travel, all before a single command reaches a device. This chapter uses the candidate you fixed in Lab 1, stored in the folder <code>final</code>.</p>

<h3>Is the session configured on both sides?</h3>
<p>A BGP session needs two matching halves: each side must name the other's address and the AS number the other side really has. Batfish checks both halves and gives two views.</p>
<table class="cmp"><tr><th>Question</th><th>Column</th><th>Values</th></tr>
<tr><td><code>bgpSessionCompatibility</code></td><td><code>Configured_Status</code></td><td>UNIQUE_MATCH, HALF_OPEN, UNKNOWN_REMOTE, NO_LOCAL_IP, MULTIPLE_REMOTES, ...</td></tr>
<tr><td><code>bgpSessionStatus</code></td><td><code>Established_Status</code></td><td>ESTABLISHED, NOT_ESTABLISHED, NOT_COMPATIBLE</td></tr></table>
<p>Compatibility is about the configuration pair. Status adds the question "would the session establish, given the modelled network?". A session appears <b>once per side</b>: our two physical sessions are four rows, which Lab 1 task 3 asks you to count. The helper that turns the table into a dictionary keeps one entry per side, keyed by node and neighbour address:</p>
<pre class="code">def sessions(bf, snap):
    """{'xe1 10.0.12.2': 'ESTABLISHED', ...} for every BGP session Batfish found."""
    frame = bf.q.bgpSessionStatus().answer(snapshot=snap).frame()
    return {"%s %s" % (r["Node"], r["Remote_IP"]): r["Established_Status"] for r in frame.to_dict("records")}</pre>

<h3>Routes and traceroute</h3>
<p>The <code>routes</code> question returns the modelled routing tables. You filter with <code>nodes=</code>, <code>protocols=</code> and <code>network=</code>. <code>traceroute</code> sends a modelled packet. You describe it with <code>HeaderConstraints</code> (here only the destination address) and say where it starts. The answer is a table whose <code>Traces</code> cell holds a list of <code>Trace</code> objects, each with a <code>disposition</code> and a hop list.</p>
<pre class="code">bf = Session(host="localhost")
bf.set_network("nk-lab")
bf.init_snapshot("live", name="live", overwrite=True)
bf.init_snapshot("final", name="final", overwrite=True)
bf.init_snapshot("candidate", name="candidate", overwrite=True)
status = bf.q.bgpSessionStatus(nodes="xe1").answer(snapshot="final").frame()
print(status[["Node", "Remote_Node", "Remote_IP", "Session_Type", "Established_Status"]])
print(bf.q.routes(nodes="e1", protocols="bgp").answer(snapshot="final").frame()[["Node", "Network", "Next_Hop_IP", "Protocol", "Admin_Distance"]])
print(bf.q.routes(nodes="e1", network="192.0.2.0/24").answer(snapshot="live").frame().shape)
for snap in ("live", "final"):
    answer = bf.q.traceroute(startLocation="e1", headers=HeaderConstraints(dstIps="192.0.2.1")).answer(snapshot=snap)
    frame = answer.frame()
    print(snap, frame.iloc[0]["Traces"][0].disposition)
print(frame.iloc[0]["Traces"][0])
assert_no_undefined_references(snapshot="final", session=bf)
assert_no_unestablished_bgp_sessions(snapshot="final", session=bf)
print("asserts passed")
try:
    assert_no_undefined_references(snapshot="candidate", session=bf)
except AssertionError as err:
    print("AssertionError:", err)</pre>
<pre class="out">AUTO01$ python3 bf_behaviour.py
Successfully initialized snapshot 'live' from 'live'
Default snapshot is now set to live
Successfully initialized snapshot 'final' from 'final'
Default snapshot is now set to final
Successfully initialized snapshot 'candidate' from 'candidate'
Default snapshot is now set to candidate
<span class="hl">   Node  Remote_Node  Remote_IP    Session_Type  Established_Status</span>
<span class="hl">0   xe1           j1  10.0.12.2  EBGP_SINGLEHOP         ESTABLISHED</span>
<span class="hl">1   xe1           e1  10.0.13.3  EBGP_SINGLEHOP         ESTABLISHED</span>
   Node       Network  Next_Hop_IP  Protocol  Admin_Distance
0    e1    1.1.1.1/32    10.0.13.1       bgp              20
1    e1    2.2.2.2/32    10.0.13.1       bgp              20
2    e1  192.0.2.0/24    10.0.13.1       bgp              20
(0, 10)
<span class="hl">live NO_ROUTE</span>
<span class="hl">final ACCEPTED</span>
1. node: e1
    ORIGINATED(default)
    FORWARDED(out Ethernet1)
    TRANSMITTED(Ethernet1)
2. node: xe1
    RECEIVED(GigabitEthernet0/1)
<span class="hl">    ACCEPTED(GigabitEthernet0/1)</span>
<span class="hl">ACCEPTED</span>
<span class="hl">asserts passed</span>
<span class="hl">AssertionError: Found undefined references: 1 result(s)</span>
         File_Name  Struct_Type      Ref_Name                 Context                 Lines
0  configs/xe1.cfg    route-map  RM-CUST-OUTT  bgp outbound route-map  configs/xe1.cfg:[30]</pre>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Two eBGP sessions and a traceroute from e1 to the customer block"><rect x="20" y="70" width="120" height="56" rx="9" fill="#bbf7d0"/><text x="80" y="94" text-anchor="middle" class="svg-ink" font-size="13">e1 (EOS)</text><text x="80" y="110" text-anchor="middle" class="svg-ink" font-size="13">AS 65003</text><rect x="260" y="70" width="120" height="56" rx="9" fill="#bae6fd"/><text x="320" y="94" text-anchor="middle" class="svg-ink" font-size="13">xe1 (IOS XE)</text><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">AS 65001</text><rect x="500" y="70" width="120" height="56" rx="9" fill="#ddd6fe"/><text x="560" y="94" text-anchor="middle" class="svg-ink" font-size="13">j1 (Junos)</text><text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="13">AS 65002</text><line x1="140" y1="98" x2="260" y2="98" stroke="#64748b" stroke-width="2"/><line x1="380" y1="98" x2="500" y2="98" stroke="#64748b" stroke-width="2"/><text x="200" y="90" text-anchor="middle" class="svg-muted" font-size="12">eBGP</text><text x="440" y="90" text-anchor="middle" class="svg-muted" font-size="12">eBGP</text><rect x="250" y="150" width="140" height="36" rx="9" fill="#fde68a"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="12">192.0.2.0/24 (Lo100)</text><line x1="320" y1="126" x2="320" y2="150" stroke="#94a3b8" stroke-width="2"/><line x1="80" y1="66" x2="280" y2="66" stroke="#dc2626" stroke-width="2"/><polygon points="280,66 271,71 271,61" fill="#dc2626"/><text x="180" y="52" text-anchor="middle" class="svg-accent" font-size="12">traceroute 192.0.2.1</text></svg><p class="cap">bgpSessionStatus checks the two sessions; traceroute follows a packet through the modelled routes.</p></div>
<p>Read the output:</p>
<ul>
<li>The sessions of xe1 are both <code>ESTABLISHED</code>, each with <code>EBGP_SINGLEHOP</code> as type: directly connected eBGP neighbours.</li>
<li>e1 holds three BGP routes in the final candidate, including <code>192.0.2.0/24</code> with next hop 10.0.13.1 (xe1) and administrative distance 20, the eBGP value on IOS and EOS. On Junos the same kind of route would show 170.</li>
<li>In the <b>live</b> snapshot the same route question returns an empty table (shape <code>(0, 10)</code>: zero rows, ten columns). The prefix does not exist yet.</li>
<li>The traceroute from e1 to 192.0.2.1 has the disposition <code>NO_ROUTE</code> in live and <code>ACCEPTED</code> in the final candidate. The printed trace for the second one reads like a story: e1 originates the packet, forwards it out of Ethernet1, xe1 receives it and accepts it because 192.0.2.1 is its own Loopback100. This is the proof the gate looks for.</li>
</ul>

<h3>Asserts: a one-line gate for tests</h3>
<p><code>pybatfish.client.asserts</code> has ready-made checks. They raise <code>AssertionError</code> with the offending table in the message, so they drop into a pytest test from the module <b>py-pytest</b> with no glue. The last lines of the output show both outcomes: two asserts pass on the final snapshot, and one fails on the candidate that still had the typo, printing the undefined route-map. Use them for quick tests; write your own stage, as the gate does, when you want a custom message and a report.</p>

<h3>Other questions to know</h3>
<p>The same pattern (question, answer, frame) covers more. <code>testFilters</code> asks what an access list does to one packet; <code>searchFilters</code> finds a packet an access list permits or denies; <code>filterLineReachability</code> finds rules that can never match because an earlier line shadows them; <code>ospfSessionCompatibility</code> is the OSPF twin of the BGP check; <code>duplicateRouterIds</code> finds clashes. They are in the cheat sheet; the labs stay with BGP.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab computes a best-effort data plane: connected, static, OSPF (intra-area), iBGP and eBGP routes, route-maps that match on prefix-lists, access lists, communities and AS paths. A route-map match the lab does not understand counts as "match", so an unusual policy can differ from real Batfish. IS-IS, EIGRP, MPLS, EVPN, NAT and policy-based routing are parsed for warnings only. <code>Local_AS</code> in the BGP tables is an integer and <code>Remote_AS</code> a string, as in Batfish of 2023. For production decisions, run the real Batfish.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Reading only <code>bgpSessionStatus</code> and ignoring the compatibility reason when it says NOT_COMPATIBLE. (2) Tracing to an address nobody owns, which gives NO_ROUTE for the wrong reason: choose an address the target really holds. (3) Forgetting <code>snapshot=</code> and asking the question of whichever snapshot was set last. (4) Running <code>traceroute</code> only from one source: ask from each router that should reach the prefix.</p></div>
<div class="exam"><p><b>Exam trap.</b> Batfish's ESTABLISHED is a prediction from configuration. Real BGP can still be down because of an ACL on the wire, a wrong MTU, a dead optic or a TCP port filter that the configs do not describe. Pair the offline check with a post-change check on the device, as in adv-junos-validate.</p></div>

<div class="scn"><h4>The prefix that could not be reached</h4><p>A customer block was announced and the team waited for a green dashboard. A pre-deploy traceroute from each other router to the first address in the block returned NO_ROUTE on one of them. The route-map on its neighbour filtered the new prefix. The fix went into the same pull request. Without the traceroute the first sign would have been a customer ticket.</p><p><b>Lesson:</b> ask the question the customer will ask, from where the customer will ask it.</p></div>

<div class="iv"><p class="q">"How do you confirm a new prefix will be reachable before you push?"</p><p>I load live and candidate into Batfish, run <code>traceroute</code> from every router that should reach the prefix with the destination set to an address in it, and require the disposition ACCEPTED. In live it must be NO_ROUTE, which shows the test is real. Then I diff the routes to be sure nothing else moved.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>bgpSessionCompatibility</code> checks the configuration pair; <code>bgpSessionStatus</code> predicts establishment.</li>
<li>Each session shows once per side, so two sessions are four rows.</li>
<li><code>routes</code> filters by node, protocol and network; <code>traceroute</code> reports a disposition and a hop story.</li>
<li><code>pybatfish.client.asserts</code> turns questions into test one-liners.</li>
<li>The model is a prediction: pair it with a post-change check on the device.</li>
</ul></div>
`,hi:`
<p>Hygiene poochhta hai "kya map sahi hai?". Behaviour poochhta hai "kya main sach mein A se B tak gaadi chala sakta hoon?". Batfish sirf configs nahi padhta; woh compute karta hai ki unke saath routing protocols kya karenge. To aap poochh sakte ho ki BGP sessions up honge, har router ke paas kaun se routes honge aur packet kaise chalega, device par ek bhi command pahunchne se pehle. Yeh chapter Lab 1 mein theek kiya hua candidate use karta hai, jo <code>final</code> folder mein rakha hai.</p>

<h3>Kya session dono taraf configured hai?</h3>
<p>BGP session ko do milte hue hisse chahiye: har side doosre ka address aur woh AS number batata hai jo doosri side ke paas sach mein hai. Batfish dono hisse check karta hai aur do views deta hai.</p>
<table class="cmp"><tr><th>Question</th><th>Column</th><th>Values</th></tr>
<tr><td><code>bgpSessionCompatibility</code></td><td><code>Configured_Status</code></td><td>UNIQUE_MATCH, HALF_OPEN, UNKNOWN_REMOTE, NO_LOCAL_IP, MULTIPLE_REMOTES, ...</td></tr>
<tr><td><code>bgpSessionStatus</code></td><td><code>Established_Status</code></td><td>ESTABLISHED, NOT_ESTABLISHED, NOT_COMPATIBLE</td></tr></table>
<p>Compatibility configuration ki jodi ke baare mein hai. Status usme sawaal jodta hai "modelled network mein session establish hoga?". Session <b>har side se ek baar</b> dikhta hai: hamare do physical sessions chaar rows hain, jo Lab 1 ka task 3 ginne ko kehta hai. Table ko dictionary banane wala helper har side ke liye ek entry rakhta hai, node aur neighbour address ki key ke saath:</p>
<pre class="code">def sessions(bf, snap):
    """{'xe1 10.0.12.2': 'ESTABLISHED', ...} for every BGP session Batfish found."""
    frame = bf.q.bgpSessionStatus().answer(snapshot=snap).frame()
    return {"%s %s" % (r["Node"], r["Remote_IP"]): r["Established_Status"] for r in frame.to_dict("records")}</pre>

<h3>Routes aur traceroute</h3>
<p><code>routes</code> question modelled routing tables lautata hai. Filter <code>nodes=</code>, <code>protocols=</code> aur <code>network=</code> se lagta hai. <code>traceroute</code> ek modelled packet bhejta hai. Use <code>HeaderConstraints</code> se describe karte ho (yahan sirf destination address) aur batate ho kahan se shuru ho. Answer ek table hai jiske <code>Traces</code> cell mein <code>Trace</code> objects ki list hoti hai, har ek ka <code>disposition</code> aur hop list.</p>
<pre class="code">bf = Session(host="localhost")
bf.set_network("nk-lab")
bf.init_snapshot("live", name="live", overwrite=True)
bf.init_snapshot("final", name="final", overwrite=True)
bf.init_snapshot("candidate", name="candidate", overwrite=True)
status = bf.q.bgpSessionStatus(nodes="xe1").answer(snapshot="final").frame()
print(status[["Node", "Remote_Node", "Remote_IP", "Session_Type", "Established_Status"]])
print(bf.q.routes(nodes="e1", protocols="bgp").answer(snapshot="final").frame()[["Node", "Network", "Next_Hop_IP", "Protocol", "Admin_Distance"]])
print(bf.q.routes(nodes="e1", network="192.0.2.0/24").answer(snapshot="live").frame().shape)
for snap in ("live", "final"):
    answer = bf.q.traceroute(startLocation="e1", headers=HeaderConstraints(dstIps="192.0.2.1")).answer(snapshot=snap)
    frame = answer.frame()
    print(snap, frame.iloc[0]["Traces"][0].disposition)
print(frame.iloc[0]["Traces"][0])
assert_no_undefined_references(snapshot="final", session=bf)
assert_no_unestablished_bgp_sessions(snapshot="final", session=bf)
print("asserts passed")
try:
    assert_no_undefined_references(snapshot="candidate", session=bf)
except AssertionError as err:
    print("AssertionError:", err)</pre>
<pre class="out">AUTO01$ python3 bf_behaviour.py
Successfully initialized snapshot 'live' from 'live'
Default snapshot is now set to live
Successfully initialized snapshot 'final' from 'final'
Default snapshot is now set to final
Successfully initialized snapshot 'candidate' from 'candidate'
Default snapshot is now set to candidate
<span class="hl">   Node  Remote_Node  Remote_IP    Session_Type  Established_Status</span>
<span class="hl">0   xe1           j1  10.0.12.2  EBGP_SINGLEHOP         ESTABLISHED</span>
<span class="hl">1   xe1           e1  10.0.13.3  EBGP_SINGLEHOP         ESTABLISHED</span>
   Node       Network  Next_Hop_IP  Protocol  Admin_Distance
0    e1    1.1.1.1/32    10.0.13.1       bgp              20
1    e1    2.2.2.2/32    10.0.13.1       bgp              20
2    e1  192.0.2.0/24    10.0.13.1       bgp              20
(0, 10)
<span class="hl">live NO_ROUTE</span>
<span class="hl">final ACCEPTED</span>
1. node: e1
    ORIGINATED(default)
    FORWARDED(out Ethernet1)
    TRANSMITTED(Ethernet1)
2. node: xe1
    RECEIVED(GigabitEthernet0/1)
<span class="hl">    ACCEPTED(GigabitEthernet0/1)</span>
<span class="hl">ACCEPTED</span>
<span class="hl">asserts passed</span>
<span class="hl">AssertionError: Found undefined references: 1 result(s)</span>
         File_Name  Struct_Type      Ref_Name                 Context                 Lines
0  configs/xe1.cfg    route-map  RM-CUST-OUTT  bgp outbound route-map  configs/xe1.cfg:[30]</pre>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Do eBGP sessions aur e1 se customer block tak traceroute"><rect x="20" y="70" width="120" height="56" rx="9" fill="#bbf7d0"/><text x="80" y="94" text-anchor="middle" class="svg-ink" font-size="13">e1 (EOS)</text><text x="80" y="110" text-anchor="middle" class="svg-ink" font-size="13">AS 65003</text><rect x="260" y="70" width="120" height="56" rx="9" fill="#bae6fd"/><text x="320" y="94" text-anchor="middle" class="svg-ink" font-size="13">xe1 (IOS XE)</text><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">AS 65001</text><rect x="500" y="70" width="120" height="56" rx="9" fill="#ddd6fe"/><text x="560" y="94" text-anchor="middle" class="svg-ink" font-size="13">j1 (Junos)</text><text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="13">AS 65002</text><line x1="140" y1="98" x2="260" y2="98" stroke="#64748b" stroke-width="2"/><line x1="380" y1="98" x2="500" y2="98" stroke="#64748b" stroke-width="2"/><text x="200" y="90" text-anchor="middle" class="svg-muted" font-size="12">eBGP</text><text x="440" y="90" text-anchor="middle" class="svg-muted" font-size="12">eBGP</text><rect x="250" y="150" width="140" height="36" rx="9" fill="#fde68a"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="12">192.0.2.0/24 (Lo100)</text><line x1="320" y1="126" x2="320" y2="150" stroke="#94a3b8" stroke-width="2"/><line x1="80" y1="66" x2="280" y2="66" stroke="#dc2626" stroke-width="2"/><polygon points="280,66 271,71 271,61" fill="#dc2626"/><text x="180" y="52" text-anchor="middle" class="svg-accent" font-size="12">traceroute 192.0.2.1</text></svg><p class="cap">bgpSessionStatus do sessions check karta hai; traceroute modelled routes se packet ko follow karta hai.</p></div>
<p>Output padho:</p>
<ul>
<li>xe1 ke dono sessions <code>ESTABLISHED</code> hain, type <code>EBGP_SINGLEHOP</code>: seedhe jude eBGP neighbours.</li>
<li>Final candidate mein e1 ke paas teen BGP routes hain, jinme <code>192.0.2.0/24</code> next hop 10.0.13.1 (xe1) aur administrative distance 20 ke saath hai, jo IOS aur EOS par eBGP ki value hai. Junos par isi tarah ka route 170 dikhata.</li>
<li><b>Live</b> snapshot mein wahi route question khaali table lautata hai (shape <code>(0, 10)</code>: zero rows, das columns). Prefix abhi maujood hi nahi.</li>
<li>e1 se 192.0.2.1 tak traceroute ka disposition live mein <code>NO_ROUTE</code> aur final candidate mein <code>ACCEPTED</code> hai. Doosre ka printed trace kahani ki tarah padhta hai: e1 packet originate karta hai, Ethernet1 se forward karta hai, xe1 receive karke accept kar leta hai kyunki 192.0.2.1 uska apna Loopback100 hai. Gate yahi saboot dhoondhta hai.</li>
</ul>

<h3>Asserts: tests ke liye ek line ka gate</h3>
<p><code>pybatfish.client.asserts</code> mein tayyar checks hain. Woh message mein gunehgaar table ke saath <code>AssertionError</code> raise karte hain, isliye <b>py-pytest</b> module ke pytest test mein bina glue ke fit ho jaate hain. Output ki aakhri lines dono nateeje dikhati hain: final snapshot par do asserts pass hote hain, aur typo wale candidate par ek fail hota hai aur undefined route-map print karta hai. Quick tests ke liye inhe use karo; jab custom message aur report chahiye tab apna stage likho, jaise gate karta hai.</p>

<h3>Aur jaanne layak questions</h3>
<p>Wahi pattern (question, answer, frame) aur bahut kuch cover karta hai. <code>testFilters</code> poochhta hai ki access list ek packet ke saath kya karti hai; <code>searchFilters</code> aisa packet dhoondhta hai jo access list permit ya deny karti hai; <code>filterLineReachability</code> aise rules dhoondhta hai jo kabhi match nahi honge kyunki pehli line unhe dhak deti hai; <code>ospfSessionCompatibility</code> BGP check ka OSPF jodidar hai; <code>duplicateRouterIds</code> clashes dhoondhta hai. Yeh cheat sheet mein hain; labs BGP tak rehte hain.</p>

<div class="note"><p><b>Lab mein vs real gear par.</b> Lab best-effort data plane compute karta hai: connected, static, OSPF (intra-area), iBGP aur eBGP routes, route-maps jo prefix-lists, access lists, communities aur AS paths par match karte hain. Jo route-map match lab nahi samajhta woh "match" maana jaata hai, isliye anokhi policy real Batfish se alag nikal sakti hai. IS-IS, EIGRP, MPLS, EVPN, NAT aur policy-based routing sirf warnings ke liye parse hote hain. BGP tables mein <code>Local_AS</code> integer hai aur <code>Remote_AS</code> string, jaise 2023 ke Batfish mein. Production decisions ke liye asli Batfish chalao.</p></div>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Sirf <code>bgpSessionStatus</code> padhna aur NOT_COMPATIBLE kehne par compatibility ki wajah ignore karna. (2) Aise address tak trace karna jise koi own nahi karta, jo galat wajah se NO_ROUTE deta hai: aisa address chuno jo target ke paas sach mein hai. (3) <code>snapshot=</code> bhool jaana aur sawaal uss snapshot se poochhna jo aakhri baar set hua tha. (4) <code>traceroute</code> sirf ek source se chalana: har us router se poochho jo prefix tak pahunche.</p></div>
<div class="exam"><p><b>Exam trap.</b> Batfish ka ESTABLISHED configuration se ki gayi bhavishyavani hai. Asli BGP phir bhi down ho sakta hai wire par ACL, galat MTU, mari hui optic ya TCP port filter ki wajah se, jinhe configs describe nahi karte. Offline check ko device par post-change check ke saath jodo, jaise adv-junos-validate mein.</p></div>

<div class="scn"><h4>Woh prefix jo pahunch se bahar tha</h4><p>Customer block announce hua aur team green dashboard ka intezaar karti rahi. Pre-deploy mein har doosre router se block ke pehle address tak traceroute ne ek router par NO_ROUTE diya. Uske neighbour ke route-map ne naya prefix filter kar diya tha. Fix usi pull request mein gaya. Traceroute ke bina pehla sanket customer ka ticket hota.</p><p><b>Lesson:</b> woh sawaal poochho jo customer poochhega, wahan se jahan se customer poochhega.</p></div>

<div class="iv"><p class="q">"Push se pehle kaise confirm karte ho ki naya prefix reachable hoga?"</p><p>Main live aur candidate Batfish mein load karta hoon, har us router se jo prefix tak pahunche <code>traceroute</code> chalata hoon jiska destination prefix ke andar ka address ho, aur disposition ACCEPTED maangta hoon. Live mein woh NO_ROUTE hona chahiye, jisse test asli saabit hota hai. Phir routes ka diff leta hoon ki aur kuch na hila ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>bgpSessionCompatibility</code> configuration ki jodi check karta hai; <code>bgpSessionStatus</code> establishment ka andaaza deta hai.</li>
<li>Har session har side se ek baar dikhta hai, isliye do sessions chaar rows hain.</li>
<li><code>routes</code> node, protocol aur network se filter hota hai; <code>traceroute</code> disposition aur hop kahani deta hai.</li>
<li><code>pybatfish.client.asserts</code> questions ko test ki ek line bana deta hai.</li>
<li>Model ek andaaza hai: ise device par post-change check ke saath jodo.</li>
</ul></div>
`}};export{e as default};
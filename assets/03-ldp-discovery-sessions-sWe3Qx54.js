var e=(e,t,n)=>`<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="LDP discovery and session"><rect x="40" y="30" width="150" height="50" rx="8" fill="#bae6fd"/><text x="115" y="53" text-anchor="middle" class="svg-ink" font-size="13">PE1</text><text x="115" y="70" text-anchor="middle" class="svg-muted" font-size="11">LDP ID 10.0.255.1:0</text><rect x="450" y="30" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="525" y="53" text-anchor="middle" class="svg-ink" font-size="13">P1</text><text x="525" y="70" text-anchor="middle" class="svg-muted" font-size="11">LDP ID 10.0.255.2:0</text><line x1="190" y1="45" x2="450" y2="45" stroke="#0ea5e9" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="38" text-anchor="middle" class="svg-accent" font-size="12">`+t+`</text><line x1="190" y1="68" x2="450" y2="68" stroke="#64748b" stroke-width="2"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="12">`+n+`</text><text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">1 hello on link  2 TCP to transport address  3 init, keepalive  4 address + label mapping</text><text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Higher transport address opens the TCP connection (active role)</text></svg><p class="cap">`+e+`</p></div>`,t={id:`ldp-discovery-sessions`,h:{en:`How LDP works: discovery, sessions and label distribution`,hi:`LDP kaise kaam karta hai: discovery, sessions aur label distribution`},body:{en:`
<p>LDP has two jobs: find neighbouring label routers, then exchange the labels they have assigned to prefixes. It does both with two kinds of messages, over two transports, on one well-known port: 646.</p>

<h3>Step 1: discovery with UDP hellos</h3>
<p>Each router sends <b>hello</b> messages out every MPLS-enabled interface, over <b>UDP port 646</b> to the multicast address 224.0.0.2 (all routers on this subnet). These are basic discovery hellos for <b>directly connected</b> neighbours. A router that hears a hello knows a possible LDP neighbour exists on that link. Hellos repeat every few seconds; the lab output of <code>show mpls ldp parameters</code> shows the timers:</p>
<pre class="out">PE1# show mpls ldp parameters
Session hold time: 180 sec; keep alive interval: 60 sec
Discovery hello: holdtime: 15 sec; interval: 5 sec
Discovery targeted hello: holdtime: 90 sec; interval: 10 sec</pre>
<p>Link hellos use 15 second hold and 5 second interval. <b>Targeted hellos</b> are unicast hellos to a non-directly connected router; they are used for LDP session protection and for pseudowires (chapter 6).</p>

<h3>Step 2: the TCP session</h3>
<p>Every hello carries the sender's <b>LDP ID</b> (router ID plus label space 0, written 10.0.255.2:0) and its <b>transport address</b>, by default the LDP router ID. The router with the <b>higher</b> transport address opens a <b>TCP connection to port 646</b> of the other. This is why the LDP router ID must be an address that is <b>reachable</b> (an IS-IS-advertised loopback): if it is not, the TCP connection cannot be formed. After TCP, the two routers exchange <b>Initialization</b> messages to agree on parameters and then <b>Keepalives</b>. The session is <b>Operational</b>.</p>
<pre class="out">PE1# show mpls ldp neighbor
    Peer LDP Ident: 10.0.255.2:0; Local LDP Ident 10.0.255.1:0
        TCP connection: 10.0.255.2.19395 - 10.0.255.1.646
        State: <span class="hl">Oper</span>; Msgs sent/rcvd: 8/8; Downstream
        Up time: 00:00:28
        LDP discovery sources:
          GigabitEthernet0/1, Src IP addr: 10.0.12.2
        Addresses bound to peer LDP Ident:
          10.0.12.2       10.0.23.2       10.0.255.2</pre>
<p>Read the output: peer 10.0.255.2:0 is P1 and the session is Oper. The TCP line shows the higher address, 10.0.255.2, opened the connection to port 646 on PE1. "Discovery sources" names the interface where the hello was heard. "Addresses bound to peer" lists all P1's interface addresses (sent in <b>Address</b> messages) so that PE1 can map any IGP next hop address to the right LDP neighbour: that mapping is how the LFIB picks the label from the right neighbour.</p>

@@D@@

<h3>Step 3: exchanging labels</h3>
<p>Once Operational, each router advertises <b>label mapping</b> messages: "to reach FEC 10.0.255.4/32, send me packets with label 18". LDP uses these modes by default on Cisco:</p>
<table class="cmp"><tr><th>Property</th><th>Default</th><th>Meaning</th></tr>
<tr><td>Label distribution</td><td>Downstream unsolicited (DU)</td><td>A router advertises labels for all its prefixes without being asked.</td></tr>
<tr><td>Label retention</td><td>Liberal</td><td>It keeps labels from all neighbours, even if they are not the IGP next hop. Speeds up reroute.</td></tr>
<tr><td>LSP control</td><td>Ordered</td><td>A router advertises a label for a prefix only after it has a label from its next hop (or is the egress).</td></tr></table>
<p>LDP also uses Label Withdraw and Label Release messages when a label is no longer valid. Note that LDP carries labels for <b>IGP prefixes</b> only. It never carries customer routes: in an MPLS VPN the VPN label comes from BGP (next module).</p>

<div class="eg"><p><b>Worked example: who opens the TCP session?</b> PE1 has LDP ID 10.0.255.1 and P1 has 10.0.255.2. 10.0.255.2 is the higher address, so P1 initiates TCP to 10.0.255.1 port 646. This explains the output above: connection 10.0.255.2.19395 - 10.0.255.1.646. The source port 19395 is a random high port on P1.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using an LDP router ID that IS-IS does not advertise. Blocking TCP or UDP 646 with an ACL on a core link. Expecting LDP to work over a link that has no IS-IS adjacency: LDP follows the IGP.</p></div>
<div class="exam"><p><b>Exam trap.</b> Discovery is UDP 646 to 224.0.0.2; the session is TCP 646. The higher transport address is the active opener. The LDP ID is the router ID plus :0 (the platform label space).</p></div>

<div class="scn"><h4>Hellos seen, session never formed</h4><p>An engineer saw the neighbour listed under <code>show mpls ldp discovery</code> but no entry in <code>show mpls ldp neighbor</code>. The discovery line said "no route" for the neighbour's LDP ID: the neighbour's router ID was a loopback that IS-IS did not advertise. Pointing the router ID at the advertised Loopback0 formed the session in seconds.</p><p><b>Lesson:</b> "discovered but no session" almost always means the transport address is unreachable.</p></div>

<div class="iv"><p class="q">"Describe how an LDP session is established."</p><p>Routers send UDP hellos to 224.0.0.2 port 646 on MPLS interfaces. The hello carries the LDP ID and transport address. The router with the higher transport address opens a TCP session to port 646, then Initialization and Keepalive messages make it Operational. Then they exchange Address and Label Mapping messages, by default downstream unsolicited with liberal retention and ordered control.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Discovery: UDP 646 multicast 224.0.0.2; session: TCP 646.</li>
<li>Higher transport address opens the TCP connection.</li>
<li>The router ID must be an IGP-reachable loopback.</li>
<li>Defaults: downstream unsolicited, liberal retention, ordered control.</li>
<li>LDP labels IGP prefixes only; VPN labels come from BGP.</li>
</ul></div>
`.replace(`@@D@@`,e(`Discovery by UDP hellos, then a TCP session, then label exchange.`,`UDP hello 224.0.0.2:646`,`TCP session to port 646`)),hi:`
<p>LDP ke do kaam hain: paas ke label routers dhoondhna, phir prefixes ko diye gaye labels exchange karna. Dono kaam do tarah ke messages se hote hain, do transports par, ek well-known port par: 646.</p>

<h3>Step 1: UDP hellos se discovery</h3>
<p>Har router har MPLS-enabled interface par <b>hello</b> messages bhejta hai, <b>UDP port 646</b> par multicast address 224.0.0.2 (is subnet ke saare routers) ko. Yeh <b>directly connected</b> neighbours ke liye basic discovery hellos hain. Jo router hello sunta hai use pata chalta hai ki us link par possible LDP neighbour hai. Hellos kuch seconds mein repeat hote hain; <code>show mpls ldp parameters</code> ka lab output timers dikhata hai:</p>
<pre class="out">PE1# show mpls ldp parameters
Session hold time: 180 sec; keep alive interval: 60 sec
Discovery hello: holdtime: 15 sec; interval: 5 sec
Discovery targeted hello: holdtime: 90 sec; interval: 10 sec</pre>
<p>Link hellos 15 second hold aur 5 second interval use karte hain. <b>Targeted hellos</b> non-directly connected router ko unicast hellos hain; LDP session protection aur pseudowires ke liye use hote hain (chapter 6).</p>

<h3>Step 2: TCP session</h3>
<p>Har hello sender ka <b>LDP ID</b> (router ID plus label space 0, 10.0.255.2:0 likha jaata hai) aur uska <b>transport address</b> le jaata hai, default mein LDP router ID. <b>Higher</b> transport address wala router doosre ke <b>port 646 par TCP connection</b> kholta hai. Isiliye LDP router ID aisa address hona chahiye jo <b>reachable</b> ho (IS-IS-advertised loopback): reachable na ho to TCP connection nahi ban sakta. TCP ke baad dono routers parameters tay karne ke liye <b>Initialization</b> messages aur phir <b>Keepalives</b> badalte hain. Session <b>Operational</b> ho jaata hai.</p>
<pre class="out">PE1# show mpls ldp neighbor
    Peer LDP Ident: 10.0.255.2:0; Local LDP Ident 10.0.255.1:0
        TCP connection: 10.0.255.2.19395 - 10.0.255.1.646
        State: <span class="hl">Oper</span>; Msgs sent/rcvd: 8/8; Downstream
        Up time: 00:00:28
        LDP discovery sources:
          GigabitEthernet0/1, Src IP addr: 10.0.12.2
        Addresses bound to peer LDP Ident:
          10.0.12.2       10.0.23.2       10.0.255.2</pre>
<p>Output padho: peer 10.0.255.2:0 P1 hai aur session Oper hai. TCP line dikhati hai ki higher address 10.0.255.2 ne PE1 ke port 646 par connection khola. "Discovery sources" us interface ka naam hai jahan hello suna gaya. "Addresses bound to peer" P1 ke saare interface addresses ki list hai (<b>Address</b> messages se) taaki PE1 kisi bhi IGP next hop address ko sahi LDP neighbour se map kar sake: yahi mapping LFIB ko sahi neighbour se label chunne deti hai.</p>

@@D@@

<h3>Step 3: labels exchange karna</h3>
<p>Operational hone par har router <b>label mapping</b> messages advertise karta hai: "FEC 10.0.255.4/32 tak pahunchne ke liye mujhe label 18 ke saath packets bhejo". Cisco par LDP default mein yeh modes use karta hai:</p>
<table class="cmp"><tr><th>Property</th><th>Default</th><th>Matlab</th></tr>
<tr><td>Label distribution</td><td>Downstream unsolicited (DU)</td><td>Router bina poochhe apne saare prefixes ke labels advertise karta hai.</td></tr>
<tr><td>Label retention</td><td>Liberal</td><td>Woh saare neighbours ke labels rakhta hai, bhale hi woh IGP next hop na hon. Reroute tez karta hai.</td></tr>
<tr><td>LSP control</td><td>Ordered</td><td>Router prefix ka label tabhi advertise karta hai jab uske paas next hop se label ho (ya woh egress ho).</td></tr></table>
<p>LDP Label Withdraw aur Label Release messages bhi use karta hai jab label valid na rahe. Dhyan do ki LDP sirf <b>IGP prefixes</b> ke labels carry karta hai. Woh customer routes kabhi carry nahi karta: MPLS VPN mein VPN label BGP se aata hai (agla module).</p>

<div class="eg"><p><b>Worked example: TCP session kaun kholta hai?</b> PE1 ka LDP ID 10.0.255.1 aur P1 ka 10.0.255.2 hai. 10.0.255.2 higher address hai, isliye P1 10.0.255.1 port 646 par TCP initiate karta hai. Yeh upar ka output explain karta hai: connection 10.0.255.2.19395 - 10.0.255.1.646. Source port 19395 P1 ka random high port hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Aisa LDP router ID use karna jise IS-IS advertise nahi karta. Core link par ACL se TCP ya UDP 646 block karna. Aise link par LDP ki ummeed jahan IS-IS adjacency nahi: LDP IGP ko follow karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Discovery UDP 646 se 224.0.0.2; session TCP 646. Higher transport address active opener hai. LDP ID router ID plus :0 (platform label space) hai.</p></div>

<div class="scn"><h4>Hellos dikhe, session kabhi nahi bana</h4><p>Engineer ne <code>show mpls ldp discovery</code> mein neighbour dekha par <code>show mpls ldp neighbor</code> mein koi entry nahi thi. Discovery line neighbour ke LDP ID ke liye "no route" keh rahi thi: neighbour ka router ID aisa loopback tha jise IS-IS advertise nahi karta tha. Router ID ko advertised Loopback0 par point karne se session seconds mein bana.</p><p><b>Lesson:</b> "discovered but no session" lagbhag hamesha matlab transport address unreachable hai.</p></div>

<div class="iv"><p class="q">"LDP session kaise establish hota hai, samjhao."</p><p>Routers MPLS interfaces par 224.0.0.2 port 646 ko UDP hellos bhejte hain. Hello LDP ID aur transport address le jaata hai. Higher transport address wala router port 646 par TCP session kholta hai, phir Initialization aur Keepalive messages se Operational hota hai. Phir woh Address aur Label Mapping messages badalte hain, default mein downstream unsolicited, liberal retention aur ordered control ke saath.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Discovery: UDP 646 multicast 224.0.0.2; session: TCP 646.</li>
<li>Higher transport address TCP connection kholta hai.</li>
<li>Router ID IGP-reachable loopback hona chahiye.</li>
<li>Defaults: downstream unsolicited, liberal retention, ordered control.</li>
<li>LDP sirf IGP prefixes label karta hai; VPN labels BGP se aate hain.</li>
</ul></div>
`.replace(`@@D@@`,e(`UDP hellos se discovery, phir TCP session, phir label exchange.`,`UDP hello 224.0.0.2:646`,`port 646 par TCP session`))}};export{t as default};
var e=(e,t)=>`<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="MPLS troubleshooting order"><rect x="10" y="30" width="120" height="50" rx="8" fill="#bae6fd"/><text x="70" y="60" text-anchor="middle" class="svg-ink" font-size="12">1 IGP route</text><rect x="148" y="30" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="208" y="60" text-anchor="middle" class="svg-ink" font-size="12">2 LDP sessions</text><rect x="286" y="30" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="346" y="60" text-anchor="middle" class="svg-ink" font-size="12">3 LFIB labels</text><rect x="424" y="30" width="100" height="50" rx="8" fill="#fde68a"/><text x="474" y="60" text-anchor="middle" class="svg-ink" font-size="12">4 Sync</text><rect x="542" y="30" width="90" height="50" rx="8" fill="#fed7aa"/><text x="587" y="60" text-anchor="middle" class="svg-ink" font-size="12">5 Trace</text><line x1="130" y1="55" x2="148" y2="55" stroke="#64748b" stroke-width="2"/><line x1="268" y1="55" x2="286" y2="55" stroke="#64748b" stroke-width="2"/><line x1="406" y1="55" x2="424" y2="55" stroke="#64748b" stroke-width="2"/><line x1="524" y1="55" x2="542" y2="55" stroke="#64748b" stroke-width="2"/><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">`+t+`</text></svg><p class="cap">`+e+`</p></div>`,t={id:`troubleshooting-workflow`,h:{en:`Troubleshooting workflow: MPLS works for IP but not for labels`,hi:`Troubleshooting workflow: MPLS IP ke liye chalta hai par labels ke liye nahi`},body:{en:`
<p>Most MPLS faults are label faults: IP works, labelled services fail. Always check the layers from the bottom: IGP, then LDP sessions, then the label tables, then synchronization, then an end-to-end trace. The five checks are below, followed by a walkthrough of the second lab with real output.</p>

@@D@@

<h3>The five checks</h3>
<ol>
<li><b>IGP</b>: <code>show ip route X</code>, <code>show isis neighbors</code>. Does a route to the remote loopback exist, and through which interface?</li>
<li><b>LDP discovery and sessions</b>: <code>show mpls interfaces</code> (is the interface MPLS-enabled?), <code>show mpls ldp discovery</code> (are hellos heard? "no route"?), <code>show mpls ldp neighbor</code> (State Oper?).</li>
<li><b>Label tables</b>: <code>show mpls forwarding-table</code>. Any <b>No Label</b> in the Outgoing column on the IGP next hop?</li>
<li><b>Synchronization</b>: <code>show isis database detail</code>. A link at 16777214 means IS-IS is waiting for LDP.</li>
<li><b>End to end</b>: <code>traceroute</code> from the ingress PE: a label at each core hop and none on the last.</li>
</ol>

<h3>Walkthrough: the unlabelled shortcut</h3>
<p><b>Ticket.</b> "The VPN team says labelled traffic through the P1 path dies; IP is fine."</p>
<p><b>Check 1.</b> The IGP prefers P1:</p>
<pre class="out">PE1# show ip route 10.0.255.4
  Known via "isis", distance 115, metric 20
  * 10.0.12.2, via GigabitEthernet0/0</pre>
<p><b>Check 2.</b> LDP on that interface:</p>
<pre class="out">PE1# show mpls ldp discovery
        GigabitEthernet0/0 (ldp): xmit/recv
            LDP Id: <span class="hl">7.7.7.7:0; no route</span>
PE1# show mpls ldp neighbor
    Peer LDP Ident: 10.0.255.3:0; Local LDP Ident 10.0.255.1:0
        State: Oper; ...</pre>
<p>Only the neighbour on Gi0/1 (P2, 10.0.255.3) is Oper. P1's LDP ID is 7.7.7.7, which is not in the IGP: "no route". On P1 itself the output is symmetrical: the neighbour list is empty and both hellos say "no route".</p>
<pre class="out">P1# show mpls ldp discovery
 Local LDP Identifier:
    7.7.7.7:0
        GigabitEthernet0/0 (ldp): xmit/recv
            LDP Id: 10.0.255.1:0; no route
        GigabitEthernet0/1 (ldp): xmit/recv
            LDP Id: 10.0.255.4:0; no route
P1# show mpls ldp neighbor</pre>
<p><b>Check 3.</b> The label table on PE1 shows <b>No Label</b> for PE2's loopback, learned on the IGP path via Gi0/0.</p>
<p><b>Fix, step 1 (protect).</b> Enable <code>mpls ldp sync</code> under <code>router isis</code> on all four routers. The links toward P1 jump to 16777214 and PE1 starts using P2 (metric 40), now with a label.</p>
<p><b>Fix, step 2 (root cause).</b> On P1 only:</p>
<pre class="code">P1(config)# mpls ldp router-id Loopback0 force</pre>
<p><b>Check 5 / verify.</b> LDP sessions to PE1 and PE2 come up (<code>show mpls ldp neighbor</code> lists two peers on P1), the max metrics disappear, the path goes back via P1 and the trace shows Label 17 on hop 1. Note the neighbour list on PE1 afterwards:</p>
<pre class="out">PE1# show mpls ldp neighbor
    Peer LDP Ident: 10.0.255.2:0; Local LDP Ident 10.0.255.1:0
        State: Oper; Msgs sent/rcvd: 8/8; Downstream
        Addresses bound to peer LDP Ident:
          10.0.12.2       10.0.24.2       10.0.255.2
          7.7.7.7
    Peer LDP Ident: 10.0.255.3:0; Local LDP Ident 10.0.255.1:0
        State: Oper; Msgs sent/rcvd: 9/9; Downstream</pre>
<p>Note that P1 still owns address 7.7.7.7 (it is in the bound addresses) but it is no longer its LDP ID.</p>

<h3>The first lab's quick faults</h3>
<ul>
<li>Interface missing from <code>show mpls interfaces</code>: no <code>ip router isis</code> on it, or <code>no mpls ldp igp autoconfig</code> configured.</li>
<li>Neighbour never appears: MPLS not enabled on one side, wrong LDP router ID, or an ACL blocking 646.</li>
<li>No Label for a PE loopback on a P router: LDP is missing on its downstream link (the VPN module's second lab is exactly this).</li>
</ul>

<div class="eg"><p><b>Worked example: reading "no route".</b> P1's LDP ID 7.7.7.7 is a loopback not advertised in IS-IS. PE1 receives P1's hello (it has the source address 10.0.12.2) but wants to open TCP to the transport address 7.7.7.7 and has no route to it. This is why the session never starts even though the link is up.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using plain ping as the proof. Fixing the IGP metric to avoid the broken link (it hides the fault). Changing the LDP router ID on a live router without <code>force</code> and wondering why nothing changes.</p></div>
<div class="exam"><p><b>Exam trap.</b> "No route" in the discovery output means the neighbour's transport address is not reachable. "No Label" in the LFIB means the IGP next hop has not advertised a label for that prefix.</p></div>

<div class="scn"><h4>The cutover that failed only for VPN customers</h4><p>After an LDP identity change on one P router, the helpdesk received VPN complaints while Internet users were fine, because Internet traffic was plain IP. The checklist above identified the missing sessions in five minutes. Sync would have prevented the outage entirely.</p><p><b>Lesson:</b> run the checks in order and enable sync before the change window.</p></div>

<div class="iv"><p class="q">"IP reachability is fine between PEs but VPN traffic fails. What do you check?"</p><p>I verify the LSP between the PE loopbacks: LDP sessions Oper on each core hop, no No Label in the LFIB toward the IGP next hop, and a traceroute showing labels on each core hop. Common culprits are a missing LDP on one link, an unreachable LDP router ID, or MTU. LDP-IGP sync prevents the situation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Check IGP, LDP sessions, LFIB, sync, then end-to-end trace.</li>
<li>"no route" in discovery means the transport address is unreachable.</li>
<li>"No Label" in the LFIB means no label from that IGP next hop.</li>
<li>Enable mpls ldp sync to avoid black holes while you fix.</li>
<li>Fix the cause (LDP router ID), not the symptom (metric).</li>
</ul></div>
`.replace(`@@D@@`,e(`Check bottom-up: the routing, then the sessions, then the labels.`,`show ip route - ldp discovery/neighbor - forwarding-table - isis database - traceroute`)),hi:`
<p>Zyadatar MPLS faults label faults hote hain: IP chalta hai, labelled services fail hoti hain. Hamesha layers neeche se check karo: IGP, phir LDP sessions, phir label tables, phir synchronization, phir end-to-end trace. Paanch checks neeche hain, uske baad doosre lab ka real output ke saath walkthrough.</p>

@@D@@

<h3>Paanch checks</h3>
<ol>
<li><b>IGP</b>: <code>show ip route X</code>, <code>show isis neighbors</code>. Kya remote loopback ka route hai, aur kis interface se?</li>
<li><b>LDP discovery aur sessions</b>: <code>show mpls interfaces</code> (kya interface MPLS-enabled hai?), <code>show mpls ldp discovery</code> (hellos sunai de rahe hain? "no route"?), <code>show mpls ldp neighbor</code> (State Oper?).</li>
<li><b>Label tables</b>: <code>show mpls forwarding-table</code>. IGP next hop par Outgoing column mein koi <b>No Label</b>?</li>
<li><b>Synchronization</b>: <code>show isis database detail</code>. 16777214 par link matlab IS-IS LDP ka intezaar kar raha hai.</li>
<li><b>End to end</b>: ingress PE se <code>traceroute</code>: har core hop par label aur aakhri par nahi.</li>
</ol>

<h3>Walkthrough: bina label wala shortcut</h3>
<p><b>Ticket.</b> "VPN team kehti hai P1 path se labelled traffic mar jaata hai; IP theek hai."</p>
<p><b>Check 1.</b> IGP P1 ko prefer karta hai:</p>
<pre class="out">PE1# show ip route 10.0.255.4
  Known via "isis", distance 115, metric 20
  * 10.0.12.2, via GigabitEthernet0/0</pre>
<p><b>Check 2.</b> Us interface par LDP:</p>
<pre class="out">PE1# show mpls ldp discovery
        GigabitEthernet0/0 (ldp): xmit/recv
            LDP Id: <span class="hl">7.7.7.7:0; no route</span>
PE1# show mpls ldp neighbor
    Peer LDP Ident: 10.0.255.3:0; Local LDP Ident 10.0.255.1:0
        State: Oper; ...</pre>
<p>Sirf Gi0/1 ka neighbour (P2, 10.0.255.3) Oper hai. P1 ka LDP ID 7.7.7.7 hai, jo IGP mein nahi: "no route". P1 par output symmetrical hai: neighbour list khaali aur dono hellos "no route" kehte hain.</p>
<pre class="out">P1# show mpls ldp discovery
 Local LDP Identifier:
    7.7.7.7:0
        GigabitEthernet0/0 (ldp): xmit/recv
            LDP Id: 10.0.255.1:0; no route
        GigabitEthernet0/1 (ldp): xmit/recv
            LDP Id: 10.0.255.4:0; no route
P1# show mpls ldp neighbor</pre>
<p><b>Check 3.</b> PE1 par label table Gi0/0 ke IGP path se seekhe PE2 loopback ke liye <b>No Label</b> dikhati hai.</p>
<p><b>Fix, step 1 (protect).</b> Chaaron routers par <code>router isis</code> ke neeche <code>mpls ldp sync</code> enable karo. P1 ki taraf ke links 16777214 par chale jaate hain aur PE1 P2 (metric 40) use karna shuru karta hai, ab label ke saath.</p>
<p><b>Fix, step 2 (root cause).</b> Sirf P1 par:</p>
<pre class="code">P1(config)# mpls ldp router-id Loopback0 force</pre>
<p><b>Check 5 / verify.</b> PE1 aur PE2 ke saath LDP sessions up ho jaate hain (P1 par <code>show mpls ldp neighbor</code> do peers dikhata hai), max metrics gayab ho jaate hain, path wapas P1 se aata hai aur trace hop 1 par Label 17 dikhata hai. Baad mein PE1 ki neighbour list dekho:</p>
<pre class="out">PE1# show mpls ldp neighbor
    Peer LDP Ident: 10.0.255.2:0; Local LDP Ident 10.0.255.1:0
        State: Oper; Msgs sent/rcvd: 8/8; Downstream
        Addresses bound to peer LDP Ident:
          10.0.12.2       10.0.24.2       10.0.255.2
          7.7.7.7
    Peer LDP Ident: 10.0.255.3:0; Local LDP Ident 10.0.255.1:0
        State: Oper; Msgs sent/rcvd: 9/9; Downstream</pre>
<p>Dhyan do ki P1 ke paas address 7.7.7.7 ab bhi hai (bound addresses mein hai) par ab woh uska LDP ID nahi.</p>

<h3>Pehle lab ke quick faults</h3>
<ul>
<li>Interface <code>show mpls interfaces</code> mein missing: us par <code>ip router isis</code> nahi, ya <code>no mpls ldp igp autoconfig</code> configured hai.</li>
<li>Neighbour kabhi nahi dikhta: ek side MPLS enable nahi, galat LDP router ID, ya ACL 646 block kar raha hai.</li>
<li>P router par PE loopback ke liye No Label: uske downstream link par LDP missing hai (VPN module ka doosra lab bilkul yahi hai).</li>
</ul>

<div class="eg"><p><b>Worked example: "no route" padhna.</b> P1 ka LDP ID 7.7.7.7 aisa loopback hai jo IS-IS mein advertise nahi hua. PE1 ko P1 ka hello milta hai (source address 10.0.12.2 ke saath) par woh transport address 7.7.7.7 par TCP kholna chahta hai aur uske paas us tak route nahi. Isiliye link up hone par bhi session shuru nahi hota.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Plain ping ko saboot maanna. Toote link se bachne ke liye IGP metric badalna (fault chhup jaata hai). Live router par LDP router ID <code>force</code> ke bina badalna aur sochna ki kuch kyun nahi badla.</p></div>
<div class="exam"><p><b>Exam trap.</b> Discovery output mein "no route" matlab neighbour ka transport address reachable nahi. LFIB mein "No Label" matlab IGP next hop ne us prefix ke liye label advertise nahi kiya.</p></div>

<div class="scn"><h4>Cutover jo sirf VPN customers ke liye fail hua</h4><p>Ek P router par LDP identity badalne ke baad helpdesk ko VPN complaints mili jabki Internet users theek the, kyunki Internet traffic plain IP tha. Upar ki checklist ne paanch minute mein missing sessions pakad liye. Sync outage ko poori tarah rok deta.</p><p><b>Lesson:</b> checks order mein chalao aur change window se pehle sync enable karo.</p></div>

<div class="iv"><p class="q">"PEs ke beech IP reachability theek hai par VPN traffic fail hai. Kya check karoge?"</p><p>Main PE loopbacks ke beech LSP verify karta hoon: har core hop par LDP sessions Oper, IGP next hop ki taraf LFIB mein koi No Label nahi, aur traceroute har core hop par labels dikhata hai. Aam culprits: ek link par LDP missing, unreachable LDP router ID, ya MTU. LDP-IGP sync is situation ko rokta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGP, LDP sessions, LFIB, sync, phir end-to-end trace check karo.</li>
<li>Discovery mein "no route" matlab transport address unreachable.</li>
<li>LFIB mein "No Label" matlab us IGP next hop se label nahi.</li>
<li>Fix karte waqt black holes se bachne ke liye mpls ldp sync enable karo.</li>
<li>Symptom (metric) nahi, cause (LDP router ID) fix karo.</li>
</ul></div>
`.replace(`@@D@@`,e(`Neeche se check karo: routing, phir sessions, phir labels.`,`show ip route - ldp discovery/neighbor - forwarding-table - isis database - traceroute`))}};export{t as default};
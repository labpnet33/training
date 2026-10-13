var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: the Monday morning ticket`,hi:`Troubleshooting workflow: Monday subah ka ticket`},body:{en:`
<p>This chapter walks through Lab 3, the Hyderabad ticket, step by step, exactly the way you should work in the simulator and in a real network. The ticket reads: <i>"After the weekend change, staff users on ACC cannot reach their gateway, the printer VLAN is dead and CORE cannot manage ACC over the untagged management VLAN."</i> Three symptoms, probably more than one cause.</p>

<h3>The design (what should be true)</h3>
<ul>
<li>Trunk ge-0/0/0 between CORE and ACC carries STAFF (30), PRINT (40) and MGMT (99).</li>
<li>MGMT is the native VLAN on both ends. CORE routes with irb.30, irb.40 and irb.99 (gateways 10.30.0.1, 10.40.0.1, 10.99.0.1). ACC manages itself on irb.99 = 10.99.0.2.</li>
<li>User ports are access ports: ge-0/0/1 and ge-0/0/2 are STAFF (PC1, PC2); ge-0/0/3 is PRINT (the printer PRN1).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Lab 3 topology">
<rect x="250" y="15" width="140" height="44" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">CORE</text>
<rect x="250" y="100" width="140" height="44" rx="10" fill="#ddd6fe"/><text x="320" y="127" text-anchor="middle" class="svg-ink" font-size="14">ACC</text>
<line x1="320" y1="59" x2="320" y2="100" stroke="#64748b" stroke-width="5"/>
<text x="332" y="85" class="svg-accent" font-size="12">trunk, native MGMT</text>
<rect x="60" y="180" width="110" height="34" rx="8" fill="#bae6fd"/><text x="115" y="202" text-anchor="middle" class="svg-ink" font-size="12">PC1 ge-0/0/1</text>
<rect x="265" y="180" width="110" height="34" rx="8" fill="#bae6fd"/><text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="12">PC2 ge-0/0/2</text>
<rect x="470" y="180" width="110" height="34" rx="8" fill="#bbf7d0"/><text x="525" y="202" text-anchor="middle" class="svg-ink" font-size="12">PRN1 ge-0/0/3</text>
<line x1="250" y1="130" x2="115" y2="180" stroke="#64748b" stroke-width="2"/><line x1="320" y1="144" x2="320" y2="180" stroke="#64748b" stroke-width="2"/><line x1="390" y1="130" x2="525" y2="180" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Lab 3: one trunk, three user ports, three VLANs and a management address.</p></div>

<h3>Step 1: inspect the trunk on ACC</h3>
<p>Start with the shared link, because it carries everything. Real output from the faulty ACC:</p>
<pre class="out">lab@ACC&gt; show ethernet-switching interface ge-0/0/0 detail
Logical Interface          : ge-0/0/0.0
  State                    : up
  Interface mode           : trunk, <span class="hl">native VLAN STAFF (30)</span>
  VLAN membership          :
    <span class="hl">STAFF                 30    untagged  Forwarding</span></pre>
<p>Two faults at once. The native VLAN is STAFF instead of MGMT, and only STAFF is in the member list: PRINT and MGMT are not carried at all. Confirm with the configuration:</p>
<pre class="out">lab@ACC&gt; show configuration interfaces ge-0/0/0
native-vlan-id STAFF;
unit 0 {
    family ethernet-switching {
        interface-mode trunk;
        vlan {
            members STAFF;
        }
    }
}</pre>

<h3>Step 2: look at the user ports</h3>
<pre class="out">lab@ACC&gt; show ethernet-switching interface
ge-0/0/2.0                       294912  294912                          <span class="hl">tagged</span>
                STAFF                    30      294912  294912  Forwarding                    tagged
ge-0/0/3.0                       294912  294912                          untagged
                PRINT                    40      294912  294912  Forwarding                    untagged</pre>
<p>ge-0/0/1 (PC1) is fine, untagged in STAFF. But ge-0/0/2 (PC2) is a trunk with tagged STAFF. PC2 sends untagged frames and the port has no native VLAN, so they are dropped. The printer port ge-0/0/3 is correct, so its failure comes from the uplink: PRINT is missing from the trunk members.</p>

<h3>Step 3: confirm symptoms before fixing</h3>
<pre class="out">lab@CORE&gt; ping 10.99.0.2 count 3
3 packets transmitted, 0 packets received, 100% packet loss

PRN1&gt; ping 10.40.0.1
host (10.40.0.1) not reachable</pre>
<p>Both match the diagnosis. It is good habit to record the failing tests so that you can repeat exactly the same test after the fix.</p>

<h3>Step 4: fix all three faults in one commit</h3>
<pre class="code">configure
set interfaces ge-0/0/0 native-vlan-id MGMT
set interfaces ge-0/0/0 unit 0 family ethernet-switching vlan members PRINT
set interfaces ge-0/0/2 unit 0 family ethernet-switching interface-mode access
show | compare
commit and-quit</pre>
<pre class="out">lab@ACC# show | compare
[edit interfaces ge-0/0/0]
-   native-vlan-id STAFF;
+   native-vlan-id MGMT;
[edit interfaces ge-0/0/0 unit 0 family ethernet-switching vlan]
-   members STAFF;
+   members [ STAFF PRINT ];
[edit interfaces ge-0/0/2 unit 0 family ethernet-switching]
-   interface-mode trunk;
+   interface-mode access;</pre>
<p>Note that the trunk's member list never contained MGMT. Junos accepts a native VLAN that is not listed in the members and still carries its untagged traffic; the verification output below shows MGMT as <b>untagged</b>. Read the <code>show | compare</code> output carefully: it is a three-line proof that you changed only what you meant to change.</p>

<h3>Step 5: verify</h3>
<pre class="out">lab@CORE&gt; ping 10.99.0.2 count 3
3 packets transmitted, 3 packets received, 0% packet loss

PC1&gt; ping 10.40.0.50
84 bytes from 10.40.0.50 icmp_seq=1 ttl=63 time=0.500 ms

lab@ACC&gt; show ethernet-switching interface ge-0/0/0 detail
  Interface mode           : trunk, native VLAN MGMT (99)
  VLAN membership          :
    STAFF                 30    tagged    Forwarding
    PRINT                 40    tagged    Forwarding
    MGMT                  99    <span class="hl">untagged</span>  Forwarding</pre>
<p>The end-to-end test, PC1 printing to PRN1 across two VLANs, works with TTL 63: one routed hop through CORE.</p>

<div class="eg"><p><b>Worked example: the checklist.</b> (1) Compare both ends of every trunk. (2) Check the mode of every user port. (3) Compare the VLAN list on both ends. (4) Confirm the native VLAN on both ends. (5) Only then test Layer 3. In Lab 3 the faults sat at steps 2, 3 and 4.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Fixing one fault, testing, and stopping when one symptom disappears; tickets often hide several causes. Changing the CORE side to match a wrong ACC. The design said MGMT native, so the reference is the design, not the other end. Skipping <code>show | compare</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> A question may show two <code>detail</code> outputs and ask why untagged traffic fails: compare the native VLAN lines. If a VLAN works on one switch but not across the trunk, look at the member lists.</p></div>

<div class="scn"><h4>Fixing the wrong end</h4><p>An engineer saw native VLAN STAFF on ACC and MGMT on CORE and changed CORE to STAFF "so they match". Management worked, but the printers and the design document were now wrong, and another switch further down, which also expected MGMT, lost contact. A reviewer compared against the design and reverted CORE with <code>rollback 1</code>, then fixed ACC.</p><p><b>Lesson:</b> match the design, not the neighbour.</p></div>

<div class="iv"><p class="q">"Users on one VLAN lost connectivity after a change window. How do you approach it?"</p><p>Gather the symptoms and the design, work bottom up, compare both ends of the trunk, check port modes and member lists, look at <code>show system commit</code> for the change, fix against the design, and verify with the same tests that failed. Mention that you would use <code>commit confirmed</code> if the change could cut your own access.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Start at the shared trunk, then the user ports, then Layer 3.</li>
<li>A tagged user port, a wrong native VLAN and a missing member VLAN are the classic three Layer 2 faults.</li>
<li>Always fix against the design and review with <code>show | compare</code>.</li>
<li>Re-run the failing tests after the fix.</li>
</ul></div>
`,hi:`
<p>Yeh chapter Lab 3, Hyderabad ticket, ko step by step chalata hai, bilkul waise jaise aapko simulator aur real network mein kaam karna chahiye. Ticket kehta hai: <i>"Weekend change ke baad ACC ke staff users gateway tak nahi pahunch rahe, printer VLAN band hai aur CORE untagged management VLAN se ACC ko manage nahi kar pa raha."</i> Teen symptoms, shayad ek se zyada causes.</p>

<h3>Design (kya sach hona chahiye)</h3>
<ul>
<li>CORE aur ACC ke beech trunk ge-0/0/0 STAFF (30), PRINT (40) aur MGMT (99) le jaata hai.</li>
<li>Dono ends par MGMT native VLAN hai. CORE irb.30, irb.40 aur irb.99 (gateways 10.30.0.1, 10.40.0.1, 10.99.0.1) se route karta hai. ACC irb.99 = 10.99.0.2 par khud manage hota hai.</li>
<li>User ports access ports hain: ge-0/0/1 aur ge-0/0/2 STAFF (PC1, PC2); ge-0/0/3 PRINT (printer PRN1).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Lab 3 topology">
<rect x="250" y="15" width="140" height="44" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">CORE</text>
<rect x="250" y="100" width="140" height="44" rx="10" fill="#ddd6fe"/><text x="320" y="127" text-anchor="middle" class="svg-ink" font-size="14">ACC</text>
<line x1="320" y1="59" x2="320" y2="100" stroke="#64748b" stroke-width="5"/>
<text x="332" y="85" class="svg-accent" font-size="12">trunk, native MGMT</text>
<rect x="60" y="180" width="110" height="34" rx="8" fill="#bae6fd"/><text x="115" y="202" text-anchor="middle" class="svg-ink" font-size="12">PC1 ge-0/0/1</text>
<rect x="265" y="180" width="110" height="34" rx="8" fill="#bae6fd"/><text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="12">PC2 ge-0/0/2</text>
<rect x="470" y="180" width="110" height="34" rx="8" fill="#bbf7d0"/><text x="525" y="202" text-anchor="middle" class="svg-ink" font-size="12">PRN1 ge-0/0/3</text>
<line x1="250" y1="130" x2="115" y2="180" stroke="#64748b" stroke-width="2"/><line x1="320" y1="144" x2="320" y2="180" stroke="#64748b" stroke-width="2"/><line x1="390" y1="130" x2="525" y2="180" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Lab 3: ek trunk, teen user ports, teen VLANs aur ek management address.</p></div>

<h3>Step 1: ACC par trunk inspect karo</h3>
<p>Shared link se shuru karo, kyunki sab kuch usi par chalta hai. Faulty ACC ka real output:</p>
<pre class="out">lab@ACC&gt; show ethernet-switching interface ge-0/0/0 detail
Logical Interface          : ge-0/0/0.0
  State                    : up
  Interface mode           : trunk, <span class="hl">native VLAN STAFF (30)</span>
  VLAN membership          :
    <span class="hl">STAFF                 30    untagged  Forwarding</span></pre>
<p>Ek saath do faults. Native VLAN MGMT ki jagah STAFF hai, aur member list mein sirf STAFF hai: PRINT aur MGMT carry hi nahi hote. Configuration se confirm karo:</p>
<pre class="out">lab@ACC&gt; show configuration interfaces ge-0/0/0
native-vlan-id STAFF;
unit 0 {
    family ethernet-switching {
        interface-mode trunk;
        vlan {
            members STAFF;
        }
    }
}</pre>

<h3>Step 2: user ports dekho</h3>
<pre class="out">lab@ACC&gt; show ethernet-switching interface
ge-0/0/2.0                       294912  294912                          <span class="hl">tagged</span>
                STAFF                    30      294912  294912  Forwarding                    tagged
ge-0/0/3.0                       294912  294912                          untagged
                PRINT                    40      294912  294912  Forwarding                    untagged</pre>
<p>ge-0/0/1 (PC1) theek hai, STAFF mein untagged. Lekin ge-0/0/2 (PC2) trunk hai jisme STAFF tagged hai. PC2 untagged frames bhejta hai aur port par native VLAN nahi hai, isliye woh drop hote hain. Printer port ge-0/0/3 sahi hai, to uski failure uplink se aati hai: PRINT trunk members mein missing hai.</p>

<h3>Step 3: fix se pehle symptoms confirm karo</h3>
<pre class="out">lab@CORE&gt; ping 10.99.0.2 count 3
3 packets transmitted, 0 packets received, 100% packet loss

PRN1&gt; ping 10.40.0.1
host (10.40.0.1) not reachable</pre>
<p>Dono diagnosis se match karte hain. Fail hone wale tests note kar lena achhi aadat hai, taaki fix ke baad bilkul wahi test dobara chala sako.</p>

<h3>Step 4: teeno faults ek commit mein theek karo</h3>
<pre class="code">configure
set interfaces ge-0/0/0 native-vlan-id MGMT
set interfaces ge-0/0/0 unit 0 family ethernet-switching vlan members PRINT
set interfaces ge-0/0/2 unit 0 family ethernet-switching interface-mode access
show | compare
commit and-quit</pre>
<pre class="out">lab@ACC# show | compare
[edit interfaces ge-0/0/0]
-   native-vlan-id STAFF;
+   native-vlan-id MGMT;
[edit interfaces ge-0/0/0 unit 0 family ethernet-switching vlan]
-   members STAFF;
+   members [ STAFF PRINT ];
[edit interfaces ge-0/0/2 unit 0 family ethernet-switching]
-   interface-mode trunk;
+   interface-mode access;</pre>
<p>Dhyan do, trunk ki member list mein MGMT kabhi tha hi nahi. Junos aisa native VLAN accept karta hai jo members mein listed nahi hai aur uska untagged traffic phir bhi le jaata hai; neeche ka verification output MGMT ko <b>untagged</b> dikhata hai. <code>show | compare</code> output dhyan se padho: yeh teen-line ka saboot hai ki aapne sirf wahi badla jo badalna tha.</p>

<h3>Step 5: verify karo</h3>
<pre class="out">lab@CORE&gt; ping 10.99.0.2 count 3
3 packets transmitted, 3 packets received, 0% packet loss

PC1&gt; ping 10.40.0.50
84 bytes from 10.40.0.50 icmp_seq=1 ttl=63 time=0.500 ms

lab@ACC&gt; show ethernet-switching interface ge-0/0/0 detail
  Interface mode           : trunk, native VLAN MGMT (99)
  VLAN membership          :
    STAFF                 30    tagged    Forwarding
    PRINT                 40    tagged    Forwarding
    MGMT                  99    <span class="hl">untagged</span>  Forwarding</pre>
<p>End-to-end test, PC1 do VLANs ke paar PRN1 par print karta hai, TTL 63 ke saath chalta hai: CORE ke through ek routed hop.</p>

<div class="eg"><p><b>Worked example: checklist.</b> (1) Har trunk ke dono ends compare karo. (2) Har user port ka mode check karo. (3) Dono ends par VLAN list compare karo. (4) Dono ends par native VLAN confirm karo. (5) Tab jaakar Layer 3 test karo. Lab 3 mein faults step 2, 3 aur 4 par the.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Ek fault theek karke, test karke, ek symptom ke jaate hi ruk jaana; tickets mein aksar kai causes chhupe hote hain. CORE side ko galat ACC se match karne ke liye badalna. Design ne MGMT native kaha tha, isliye reference design hai, doosra end nahi. <code>show | compare</code> skip karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Question do <code>detail</code> outputs dikhakar pooch sakta hai ki untagged traffic kyun fail hai: native VLAN lines compare karo. Ek VLAN ek switch par chale lekin trunk ke paar na chale to member lists dekho.</p></div>

<div class="scn"><h4>Galat end theek karna</h4><p>Ek engineer ne ACC par native VLAN STAFF aur CORE par MGMT dekha aur "match karne ke liye" CORE ko STAFF kar diya. Management chal gaya, lekin printers aur design document ab galat the, aur aage ka ek aur switch, jo MGMT expect karta tha, sampark kho baitha. Ek reviewer ne design se compare karke CORE ko <code>rollback 1</code> se wapas kiya, phir ACC theek kiya.</p><p><b>Lesson:</b> design se match karo, padosi se nahi.</p></div>

<div class="iv"><p class="q">"Change window ke baad ek VLAN ke users ka connectivity chala gaya. Kaise approach karoge?"</p><p>Symptoms aur design jama karo, neeche se upar kaam karo, trunk ke dono ends compare karo, port modes aur member lists dekho, change ke liye <code>show system commit</code> dekho, design ke hisaab se fix karo, aur wahi tests chalakar verify karo jo fail hue the. Batao ki change se aapka khud ka access kat sakta ho to <code>commit confirmed</code> use karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Shared trunk se shuru karo, phir user ports, phir Layer 3.</li>
<li>Tagged user port, galat native VLAN aur missing member VLAN teen classic Layer 2 faults hain.</li>
<li>Hamesha design ke hisaab se fix karo aur <code>show | compare</code> se review karo.</li>
<li>Fix ke baad fail hone wale tests dobara chalao.</li>
</ul></div>
`}};export{e as default};
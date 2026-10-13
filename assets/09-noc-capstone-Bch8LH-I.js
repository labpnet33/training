var e=`<svg viewBox="0 0 640 270" role="img" aria-label="Capstone hub and spoke with three fault markers: a wrong next hop on the spoke1 route table, an NSG deny on the spoke2 db subnet, and a wrong custom DNS server on spoke1">
<rect x="230" y="20" width="180" height="90" rx="12" fill="#ddd6fe" stroke="#64748b"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="12">hub 10.0.0.0/16</text><rect x="255" y="55" width="130" height="40" rx="8" fill="#fde68a" stroke="#64748b"/><text x="320" y="73" text-anchor="middle" class="svg-ink" font-size="11">Azure Firewall</text><text x="320" y="87" text-anchor="middle" class="svg-muted" font-size="10">10.0.1.4</text>
<rect x="15" y="150" width="230" height="95" rx="12" fill="#bae6fd" stroke="#64748b"/><text x="130" y="172" text-anchor="middle" class="svg-ink" font-size="12">spoke1 10.1.0.0/16</text><text x="130" y="192" text-anchor="middle" class="svg-ink" font-size="11">vm-app 10.1.1.4</text><text x="130" y="210" text-anchor="middle" class="svg-muted" font-size="10">UDR + custom DNS</text>
<rect x="395" y="150" width="230" height="95" rx="12" fill="#bbf7d0" stroke="#64748b"/><text x="510" y="172" text-anchor="middle" class="svg-ink" font-size="12">spoke2 10.2.0.0/16</text><text x="510" y="192" text-anchor="middle" class="svg-ink" font-size="11">vm-db 10.2.1.4</text><text x="510" y="210" text-anchor="middle" class="svg-muted" font-size="10">nsg-db on db subnet</text>
<line x1="200" y1="150" x2="290" y2="110" stroke="#64748b" stroke-width="2"/><line x1="440" y1="150" x2="350" y2="110" stroke="#64748b" stroke-width="2"/>
<circle cx="245" cy="130" r="14" fill="#dc2626"/><text x="245" y="135" text-anchor="middle" font-size="13" fill="#fff">1</text>
<circle cx="395" cy="130" r="14" fill="#dc2626"/><text x="395" y="135" text-anchor="middle" font-size="13" fill="#fff">2</text>
<circle cx="45" cy="205" r="14" fill="#dc2626"/><text x="45" y="210" text-anchor="middle" font-size="13" fill="#fff">3</text>
<text x="320" y="262" text-anchor="middle" class="svg-muted" font-size="11">1 wrong next hop   2 NSG deny   3 wrong DNS server. Three faults, one network</text>
</svg>`,t={id:`noc-capstone`,h:{en:`NOC capstone: three faults in one hub-and-spoke`,hi:`NOC capstone: ek hub-and-spoke mein teen faults`},body:{en:`
<h3>The situation</h3>
<p>You are on the network operations desk. A hub-and-spoke network in centralindia was changed over a weekend and three tickets arrive on Monday morning. Hub 10.0.0.0/16 holds Azure Firewall at 10.0.1.4. Spoke1 10.1.0.0/16 holds vm-app 10.1.1.4. Spoke2 10.2.0.0/16 holds vm-db 10.2.1.4 behind nsg-db. Your job: for each ticket, climb the troubleshooting ladder, name the layer, prove the cause with a tool, fix it, and re-verify. All outputs below are <b>Illustrative output</b>; real field names and layout differ (verify before publishing).</p>
<div class="dia">`+e+`<p class="cap">The capstone network. Faults are numbered in the order the tickets arrive, but you will find each by method, not by guessing.</p></div>
<div class="note"><p><b>The ladder, as a reminder:</b> 1 is the problem real, 2 does the name resolve, 3 is there a route, 4 is a filter blocking it, 5 does the service answer, 6 is the path healthy over time. Always record the evidence at each rung.</p></div>

<h3>Ticket 1: "vm-app cannot reach vm-db at all, not even ping"</h3>
<p>Reported at 09:05. Test from vm-app: connection to 10.2.1.4 port 1433 times out. DNS is not involved (an IP is used), so start at rung 3.</p>
<pre class="code">az network watcher show-next-hop -g rg-nk-hub --vm vm-app --source-ip 10.1.1.4 --dest-ip 10.2.1.4</pre>
<pre class="out"><span class="c">Illustrative output</span>
NextHopType: <span class="hl">VirtualAppliance</span>   NextHopIpAddress: <span class="hl">10.0.1.40</span>   RouteTableId: rt-spoke1</pre>
<p>The route table sends spoke-to-spoke traffic to 10.0.1.40, but the firewall is at 10.0.1.4. A typo. Packets go to an address where nothing exists and vanish. The effective routes on the NIC confirm the exact route and its source (User).</p>
<pre class="code">az network nic show-effective-route-table -g rg-nk-hub -n vm-app-nic -o table</pre>
<pre class="out"><span class="c">Illustrative output</span>
Source  State   Prefix         NextHopType        NextHopIP
User    Active  10.2.0.0/16    VirtualAppliance   <span class="hl">10.0.1.40</span></pre>
<p><b>Fix:</b> correct the route next hop to 10.0.1.4. <b>Re-verify:</b> run next hop again and expect 10.0.1.4. Note: fixing the route reveals Ticket 2, because the traffic now reaches the next layer.</p>
<pre class="code">az network route-table route update -g rg-nk-hub --route-table-name rt-spoke1 -n to-spoke2 --next-hop-ip-address 10.0.1.4</pre>

<h3>Ticket 2: "Route is fixed but port 1433 still times out"</h3>
<p>The route is right, so climb to rung 4. The packet reaches the firewall, so first check that the firewall allows it (the firewall rule collection and logs). Suppose the firewall shows an allow. Then test the destination NIC filter.</p>
<pre class="code">az network watcher test-ip-flow -g rg-nk-hub --vm vm-db --direction Inbound --protocol TCP --local 10.2.1.4:1433 --remote 10.1.1.4:50000</pre>
<pre class="out"><span class="c">Illustrative output</span>
Access: <span class="hl">Deny</span>   Rule: securityRules/deny-app-sql   (priority 150)</pre>
<p>Someone added a Deny rule at priority 150 on nsg-db. The existing Allow for SQL from spoke1 sits at priority 300. Lower number wins, so the Deny is evaluated first. It is a priority mistake, not a missing allow. Look at the effective rules to see both together.</p>
<pre class="code">az network nic list-effective-nsg -g rg-nk-hub -n vm-db-nic -o table</pre>
<pre class="out"><span class="c">Illustrative output</span>
Priority  Name           Action  Port  Source
150       deny-app-sql   Deny    1433  10.1.0.0/16
300       allow-sql      Allow   1433  10.1.0.0/16</pre>
<p><b>Fix:</b> remove the deny rule, or move the allow below it by giving it a smaller number than the deny, after confirming with the change record which one was intended. <b>Re-verify:</b> IP flow verify now returns Allow and the nc test succeeds.</p>
<div class="warn"><p>Never fix a rule you do not understand just because the tool named it. Confirm intent with the change record first; an old Deny may exist for a security reason.</p></div>

<h3>Ticket 3: "App works by IP but the name db.corp.example fails"</h3>
<p>Rung 2. From vm-app, resolve the name.</p>
<pre class="code">nslookup db.corp.example</pre>
<pre class="out"><span class="c">Illustrative output</span>
;; connection timed out; no servers could be reached   (server 10.0.9.9)</pre>
<p>The VM is querying 10.0.9.9, not the Azure-provided resolver or the Private Resolver inbound endpoint. Check the VNet DNS servers setting.</p>
<pre class="code">az network vnet show -g rg-nk-hub -n spoke1 --query dhcpOptions.dnsServers</pre>
<pre class="out"><span class="c">Illustrative output</span>
["10.0.9.9"]</pre>
<p>An old custom DNS server address from a previous design remained on spoke1. <b>Fix:</b> set the correct DNS server (for example the Private Resolver inbound IP in the hub, here 10.0.3.4) or reset to default. VMs pick up the change at their next lease renewal or restart. <b>Re-verify:</b> repeat nslookup and expect the private IP, then retest the app.</p>
<pre class="code">az network vnet update -g rg-nk-hub -n spoke1 --dns-servers 10.0.3.4</pre>

<h3>Closing the loop</h3>
<ul>
<li>Run Connection Monitor from vm-app to vm-db on 1433 and watch it stay green.</li>
<li>Write one change note per fault: symptom, rung, tool, cause, fix, verification, and a preventive action (for example, review route tables in peer review, name rule priorities by range, and keep a DNS design diagram).</li>
<li>Ask whether more than one fault was present. Real incidents often have several.</li>
</ul>

<div class="scn"><h4>Three faults, one Monday</h4><p>After a weekend change window, one user ticket said the app was down. The first engineer fixed the route and declared success. Ten minutes later the same ticket came back: it still failed. A second fault, an NSG priority mistake, had been hidden behind the first. After that was fixed the name lookup still failed on a third host because of a stale DNS server.</p><p><b>Lesson:</b> after each fix, re-test the original symptom end to end and keep climbing until it passes.</p></div>

<div class="iv"><p class="q">"You fix one fault and the problem remains. What now?"</p><p>I re-run the original test from the original source, because fixing one layer often exposes the next. I resume the ladder from where the evidence stops being green: route, then filters, then DNS, then the service. I keep notes of each finding so the change record shows all three causes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method beats guessing: rung, tool, evidence, fix, re-verify.</li>
<li>A wrong next hop shows in next hop and effective routes.</li>
<li>Lower priority number wins in NSGs.</li>
<li>If the IP works but the name fails, it is DNS.</li>
<li>Faults hide behind each other; retest end to end.</li>
</ul></div>
`,hi:`
<h3>Situation</h3>
<p>Aap network operations desk par ho. Centralindia mein ek hub-and-spoke network weekend par badla gaya aur Monday subah teen tickets aaye. Hub 10.0.0.0/16 mein Azure Firewall 10.0.1.4 par hai. Spoke1 10.1.0.0/16 mein vm-app 10.1.1.4. Spoke2 10.2.0.0/16 mein vm-db 10.2.1.4, nsg-db ke peeche. Aapka kaam: har ticket ke liye troubleshooting ladder chadho, layer ka naam batao, tool se cause saabit karo, fix karo aur re-verify karo. Neeche ke saare outputs <b>Illustrative output</b> hain; asli field names aur layout alag hote hain (verify before publishing).</p>
<div class="dia">`+e+`<p class="cap">Capstone network. Faults tickets ke aane ke order mein number kiye gaye hain, par aap har ek ko method se dhundoge, andaze se nahi.</p></div>
<div class="note"><p><b>Ladder yaad dilane ke liye:</b> 1 kya problem asli hai, 2 kya naam resolve hota hai, 3 kya route hai, 4 kya koi filter block kar raha hai, 5 kya service jawab deti hai, 6 kya path waqt ke saath healthy hai. Har rung par evidence note karo.</p></div>

<h3>Ticket 1: "vm-app vm-db tak bilkul nahi pahunch raha, ping bhi nahi"</h3>
<p>09:05 par report hua. vm-app se 10.2.1.4 port 1433 par connection timeout. DNS involved nahi hai (IP use hui), isliye rung 3 se shuru karo.</p>
<pre class="code">az network watcher show-next-hop -g rg-nk-hub --vm vm-app --source-ip 10.1.1.4 --dest-ip 10.2.1.4</pre>
<pre class="out"><span class="c">Illustrative output</span>
NextHopType: <span class="hl">VirtualAppliance</span>   NextHopIpAddress: <span class="hl">10.0.1.40</span>   RouteTableId: rt-spoke1</pre>
<p>Route table spoke-to-spoke traffic 10.0.1.40 par bhejti hai, jabki firewall 10.0.1.4 par hai. Typo. Packets aise address par jaate hain jahan kuch nahi hai aur gayab ho jaate hain. NIC ki effective routes exact route aur uska source (User) confirm karti hain.</p>
<pre class="code">az network nic show-effective-route-table -g rg-nk-hub -n vm-app-nic -o table</pre>
<pre class="out"><span class="c">Illustrative output</span>
Source  State   Prefix         NextHopType        NextHopIP
User    Active  10.2.0.0/16    VirtualAppliance   <span class="hl">10.0.1.40</span></pre>
<p><b>Fix:</b> route ka next hop 10.0.1.4 karo. <b>Re-verify:</b> next hop dobara chalao aur 10.0.1.4 expect karo. Dhyan do: route fix karne se Ticket 2 dikhega, kyunki traffic ab agli layer tak pahunchta hai.</p>
<pre class="code">az network route-table route update -g rg-nk-hub --route-table-name rt-spoke1 -n to-spoke2 --next-hop-ip-address 10.0.1.4</pre>

<h3>Ticket 2: "Route fix ho gaya par port 1433 abhi bhi timeout"</h3>
<p>Route sahi hai, isliye rung 4 par chadho. Packet firewall tak pahunchta hai, isliye pehle check karo ki firewall use allow karta hai (firewall rule collection aur logs). Maan lo firewall allow dikhata hai. Phir destination NIC filter test karo.</p>
<pre class="code">az network watcher test-ip-flow -g rg-nk-hub --vm vm-db --direction Inbound --protocol TCP --local 10.2.1.4:1433 --remote 10.1.1.4:50000</pre>
<pre class="out"><span class="c">Illustrative output</span>
Access: <span class="hl">Deny</span>   Rule: securityRules/deny-app-sql   (priority 150)</pre>
<p>Kisi ne nsg-db par priority 150 ka Deny rule jod diya. Spoke1 se SQL ka maujooda Allow priority 300 par hai. Chhota number jeetta hai, isliye Deny pehle evaluate hota hai. Yeh priority ki galti hai, missing allow nahi. Dono ek saath dekhne ke liye effective rules dekho.</p>
<pre class="code">az network nic list-effective-nsg -g rg-nk-hub -n vm-db-nic -o table</pre>
<pre class="out"><span class="c">Illustrative output</span>
Priority  Name           Action  Port  Source
150       deny-app-sql   Deny    1433  10.1.0.0/16
300       allow-sql      Allow   1433  10.1.0.0/16</pre>
<p><b>Fix:</b> deny rule hatao, ya allow ko deny se chhota number do, pehle change record se confirm karke ki kaunsa intended tha. <b>Re-verify:</b> IP flow verify ab Allow deta hai aur nc test success.</p>
<div class="warn"><p>Sirf isliye ki tool ne naam bataya, aise rule ko fix mat karo jo samajh nahi aata. Pehle change record se intent confirm karo; purana Deny security reason se ho sakta hai.</p></div>

<h3>Ticket 3: "App IP se chalta hai par naam db.corp.example fail hota hai"</h3>
<p>Rung 2. vm-app se naam resolve karo.</p>
<pre class="code">nslookup db.corp.example</pre>
<pre class="out"><span class="c">Illustrative output</span>
;; connection timed out; no servers could be reached   (server 10.0.9.9)</pre>
<p>VM 10.0.9.9 se query kar rahi hai, Azure-provided resolver ya Private Resolver inbound endpoint se nahi. VNet DNS servers setting check karo.</p>
<pre class="code">az network vnet show -g rg-nk-hub -n spoke1 --query dhcpOptions.dnsServers</pre>
<pre class="out"><span class="c">Illustrative output</span>
["10.0.9.9"]</pre>
<p>Purane design ka custom DNS server address spoke1 par reh gaya. <b>Fix:</b> sahi DNS server set karo (jaise hub mein Private Resolver inbound IP, yahan 10.0.3.4) ya default par reset karo. VMs change ko agle lease renewal ya restart par uthati hain. <b>Re-verify:</b> nslookup dobara karo aur private IP expect karo, phir app retest karo.</p>
<pre class="code">az network vnet update -g rg-nk-hub -n spoke1 --dns-servers 10.0.3.4</pre>

<h3>Loop band karo</h3>
<ul>
<li>vm-app se vm-db 1433 par Connection Monitor chalao aur use green rehte dekho.</li>
<li>Har fault ke liye ek change note likho: symptom, rung, tool, cause, fix, verification, aur preventive action (jaise peer review mein route tables dekhna, rule priorities ko ranges mein naam dena, aur DNS design diagram rakhna).</li>
<li>Poochho kya ek se zyada fault the. Asli incidents mein aksar kai hote hain.</li>
</ul>

<div class="scn"><h4>Ek Monday, teen faults</h4><p>Weekend change window ke baad ek user ticket mein likha tha ki app down hai. Pehle engineer ne route fix kiya aur success declare kar diya. Das minute baad wahi ticket wapas aaya: abhi bhi fail. Doosra fault, NSG priority ki galti, pehle ke peeche chhupa tha. Woh fix hone ke baad bhi ek teesre host par stale DNS server ki wajah se name lookup fail raha.</p><p><b>Lesson:</b> har fix ke baad original symptom ko end to end retest karo aur pass hone tak chadhte raho.</p></div>

<div class="iv"><p class="q">"Ek fault fix kiya par problem abhi bhi hai. Ab kya?"</p><p>Main original test original source se dobara chalata hoon, kyunki ek layer fix karne se agli layer ujagar hoti hai. Ladder wahin se resume karta hoon jahan evidence green hona band hota hai: route, phir filters, phir DNS, phir service. Har finding ka note rakhta hoon taaki change record mein teeno causes dikhein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method andaze se behtar: rung, tool, evidence, fix, re-verify.</li>
<li>Galat next hop, next hop aur effective routes mein dikhta hai.</li>
<li>NSG mein chhota priority number jeetta hai.</li>
<li>IP chale par naam fail ho to DNS hai.</li>
<li>Faults ek doosre ke peeche chhupte hain; end to end retest karo.</li>
</ul></div>
`}};export{t as default};
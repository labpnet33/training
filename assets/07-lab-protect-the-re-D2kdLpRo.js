var e={id:`lab-protect-the-re`,h:{en:`Lab walkthrough: protect R2 and count the traffic`,hi:`Lab walkthrough: R2 ko protect karo aur traffic gino`},body:{en:`
<p>Now we build the filter from the last chapter on a real topology and prove, with counters, which traffic reaches the RE. Follow along in the lab "Transit or exception? Count it".</p>

<h3>The scenario</h3>
<p>R2 is the aggregation router between the Kochi office (behind R1) and the data centre server SRV (behind R3). Security wants R2's Routing Engine protected by a lo0 filter that counts every ping it answers. The filter must not break OSPF.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Lab topology PC1 R1 R2 R3 SRV">
<rect x="5" y="60" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="45" y="82" text-anchor="middle" class="svg-ink" font-size="12">PC1</text><text x="45" y="98" text-anchor="middle" class="svg-muted" font-size="10">10.10.1.10</text>
<rect x="120" y="60" width="80" height="50" rx="8" fill="#bae6fd"/><text x="160" y="90" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="270" y="50" width="110" height="70" rx="8" fill="#fde68a"/><text x="325" y="78" text-anchor="middle" class="svg-ink" font-size="13">R2 (AGG)</text><text x="325" y="98" text-anchor="middle" class="svg-muted" font-size="10">lo0 10.255.0.2</text>
<rect x="450" y="60" width="80" height="50" rx="8" fill="#bae6fd"/><text x="490" y="90" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="560" y="60" width="75" height="50" rx="8" fill="#bbf7d0"/><text x="597" y="82" text-anchor="middle" class="svg-ink" font-size="12">SRV</text><text x="597" y="98" text-anchor="middle" class="svg-muted" font-size="10">10.30.3.10</text>
<line x1="85" y1="85" x2="120" y2="85" stroke="#64748b" stroke-width="2"/><line x1="200" y1="85" x2="270" y2="85" stroke="#64748b" stroke-width="2"/><line x1="380" y1="85" x2="450" y2="85" stroke="#64748b" stroke-width="2"/><line x1="530" y1="85" x2="560" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="235" y="75" text-anchor="middle" class="svg-muted" font-size="10">10.12.0.0/30</text><text x="415" y="75" text-anchor="middle" class="svg-muted" font-size="10">10.23.0.0/30</text>
<text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="12">OSPF area 0 between R1, R2 and R3</text>
</svg><p class="cap">Ping from PC1 to SRV is transit on R2. Ping from PC1 to R2's loopback is exception traffic.</p></div>

<h3>Step 1: build the filter inside the hierarchy</h3>
<p>Instead of typing long set lines you can enter the filter's hierarchy with <code>edit</code>, so each line is shorter, then return with <code>top</code>:</p>
<pre class="code">lab@R2-AGG&gt; configure
lab@R2-AGG# edit firewall family inet filter PROTECT-RE
[edit firewall family inet filter PROTECT-RE]
lab@R2-AGG# set term routing from protocol ospf
lab@R2-AGG# set term routing then accept
lab@R2-AGG# set term mgmt from protocol tcp
lab@R2-AGG# set term mgmt from destination-port ssh
lab@R2-AGG# set term mgmt then accept
lab@R2-AGG# set term ping from protocol icmp
lab@R2-AGG# set term ping then count re-icmp
lab@R2-AGG# set term ping then accept
lab@R2-AGG# set term rest then count re-drop
lab@R2-AGG# set term rest then discard
lab@R2-AGG# top
lab@R2-AGG# set interfaces lo0 unit 0 family inet filter input PROTECT-RE</pre>

<h3>Step 2: commit with a safety net</h3>
<pre class="code">lab@R2-AGG# show | compare
lab@R2-AGG# commit confirmed 5
commit confirmed will be automatically rolled back in 5 minutes unless confirmed
commit complete
lab@R2-AGG# run show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.12.0.1        ge-0/0/0.0             <span class="hl">Full</span>            10.255.0.1       128    33
10.23.0.2        ge-0/0/1.0             <span class="hl">Full</span>            10.255.0.3       128    37
lab@R2-AGG# commit and-quit
commit complete</pre>
<p>Both OSPF neighbours stay <b>Full</b> because the first term accepts OSPF. Only then do you confirm with a plain commit. If a neighbour had dropped, you would simply wait five minutes and Junos would revert.</p>

<h3>Step 3: exception traffic, ping R2's loopback</h3>
<p>From PC1: <code>ping 10.255.0.2</code>. These packets are addressed to R2, so they go up to the RE and through the lo0 filter. Then check:</p>
<pre class="out">lab@R2-AGG&gt; show firewall filter PROTECT-RE

Filter: PROTECT-RE
Counters:
Name                                                Bytes              Packets
<span class="hl">re-icmp                                               420                    5</span>
re-drop                                                 0                    0</pre>

<h3>Step 4: transit traffic, ping SRV through R2</h3>
<p>From PC1: <code>ping 10.30.3.10</code>. These packets are only forwarded by R2's PFE.</p>
<pre class="out">lab@R2-AGG&gt; show pfe statistics traffic
Packet Forwarding Engine traffic statistics:
    Input  packets:                       19                     0 pps
    Output packets:                       19                     0 pps
Packet Forwarding Engine transit traffic (forwarded in hardware):
<span class="hl">    Transit packets forwarded             :                   13</span>
Packet Forwarding Engine local traffic statistics (exception traffic):
    Local packets input                   :                    6
    Local packets output                  :                    6
      of which TTL expired (sent to RE)   :                    1
      of which IP options (sent to RE)    :                    0
    Software input control plane drops    :                    0
    Software input high drops             :                    0
Packet Forwarding Engine hardware discard statistics:
    Timeout                               :                    0
    Normal discard                        :                    0
    Firewall discard                      :                    0
    Fabric drops                          :                    0

lab@R2-AGG&gt; show firewall filter PROTECT-RE
re-icmp                                               420                    5</pre>
<p>Transit packets increased, but <b>re-icmp did not</b>. The answer to the lab question "by how much did re-icmp grow because of the pings to SRV?" is <b>0</b>. The filter only sees traffic to the RE.</p>

<h3>Step 5: TTL expiry, traceroute</h3>
<p>From PC1: <code>trace 10.30.3.10</code>. The probe with TTL 2 expires on R2, so the PFE punts it and the RE sends the ICMP time-exceeded reply. Check <code>show pfe statistics traffic</code> on R2: <b>TTL expired (sent to RE)</b> is now at least 1. The ICMP time-exceeded replies also leave the RE, so they count under local output.</p>
<pre class="out">PC1&gt; trace 10.30.3.10
1   10.10.1.1     0.9 ms
2   10.12.0.2     1.4 ms
3   10.23.0.2     1.9 ms
4   10.30.3.10    2.3 ms</pre>

<div class="eg"><p><b>Interpreting the results.</b> Ping to loopback: counter up, local input up, transit unchanged. Ping to SRV: transit up, counter unchanged. Traceroute: TTL expired up. Together they prove the three ideas of this module: transit never touches the RE, local traffic does, and TTL expiry is exception traffic.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Putting the discard term before the routing term. Forgetting <code>top</code> before setting the lo0 interface line (you would set it under the filter hierarchy). Using plain commit and losing OSPF with no automatic rollback. Pinging SRV and expecting the counter to change.</p></div>

<div class="scn"><h4>Proving it to the auditor</h4><p>A bank's auditor asked for evidence that router control planes were protected. The engineer applied the lo0 filter lab-style, pinged the router's loopback from a user LAN, and showed the counter incrementing; then pinged a server through the router and showed the counter staying put, while PFE statistics showed forwarded packets. The auditor accepted the counters as proof that the filter inspected only RE-bound traffic and that transit service was unaffected.</p><p><b>Lesson:</b> counters turn a design claim into evidence.</p></div>

<div class="iv"><p class="q">"How do you prove a lo0 filter is working without breaking production?"</p><p>Apply it with commit confirmed, confirm routing adjacencies are still Full, then generate a ping to the router and check the counter increments in show firewall filter, and ping through the router to confirm the counter does not move. Use show pfe statistics traffic for the transit versus local view.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build the filter with edit, term by term, with the OSPF term first and discard last.</li>
<li>Apply it on lo0 unit 0 family inet filter input, and commit confirmed.</li>
<li>Ping to the router increments the ICMP counter; ping through it does not.</li>
<li>Transit packets increase for traffic through R2; TTL expired increases for traceroute.</li>
<li>Confirm with commit only after verifying adjacencies are Full.</li>
</ul></div>
`,hi:`
<p>Ab pichle chapter ka filter asli topology par banate hain aur counters se saabit karte hain ki kaunsa traffic RE tak pahunchta hai. Lab "Transit or exception? Count it" ke saath follow karo.</p>

<h3>Scenario</h3>
<p>R2 Kochi office (R1 ke peeche) aur data centre server SRV (R3 ke peeche) ke beech ka aggregation router hai. Security chahti hai ki R2 ka Routing Engine ek lo0 filter se protected ho jo har answered ping ko gine. Filter OSPF ko nahi todna chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Lab topology PC1 R1 R2 R3 SRV">
<rect x="5" y="60" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="45" y="82" text-anchor="middle" class="svg-ink" font-size="12">PC1</text><text x="45" y="98" text-anchor="middle" class="svg-muted" font-size="10">10.10.1.10</text>
<rect x="120" y="60" width="80" height="50" rx="8" fill="#bae6fd"/><text x="160" y="90" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="270" y="50" width="110" height="70" rx="8" fill="#fde68a"/><text x="325" y="78" text-anchor="middle" class="svg-ink" font-size="13">R2 (AGG)</text><text x="325" y="98" text-anchor="middle" class="svg-muted" font-size="10">lo0 10.255.0.2</text>
<rect x="450" y="60" width="80" height="50" rx="8" fill="#bae6fd"/><text x="490" y="90" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="560" y="60" width="75" height="50" rx="8" fill="#bbf7d0"/><text x="597" y="82" text-anchor="middle" class="svg-ink" font-size="12">SRV</text><text x="597" y="98" text-anchor="middle" class="svg-muted" font-size="10">10.30.3.10</text>
<line x1="85" y1="85" x2="120" y2="85" stroke="#64748b" stroke-width="2"/><line x1="200" y1="85" x2="270" y2="85" stroke="#64748b" stroke-width="2"/><line x1="380" y1="85" x2="450" y2="85" stroke="#64748b" stroke-width="2"/><line x1="530" y1="85" x2="560" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="235" y="75" text-anchor="middle" class="svg-muted" font-size="10">10.12.0.0/30</text><text x="415" y="75" text-anchor="middle" class="svg-muted" font-size="10">10.23.0.0/30</text>
<text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="12">R1, R2 aur R3 ke beech OSPF area 0</text>
</svg><p class="cap">PC1 se SRV tak ping R2 par transit hai. PC1 se R2 ke loopback tak ping exception traffic hai.</p></div>

<h3>Step 1: hierarchy ke andar filter banao</h3>
<p>Lambi set lines type karne ki jagah aap <code>edit</code> se filter ki hierarchy mein ja sakte ho, to har line chhoti hoti hai, phir <code>top</code> se wapas aao:</p>
<pre class="code">lab@R2-AGG&gt; configure
lab@R2-AGG# edit firewall family inet filter PROTECT-RE
[edit firewall family inet filter PROTECT-RE]
lab@R2-AGG# set term routing from protocol ospf
lab@R2-AGG# set term routing then accept
lab@R2-AGG# set term mgmt from protocol tcp
lab@R2-AGG# set term mgmt from destination-port ssh
lab@R2-AGG# set term mgmt then accept
lab@R2-AGG# set term ping from protocol icmp
lab@R2-AGG# set term ping then count re-icmp
lab@R2-AGG# set term ping then accept
lab@R2-AGG# set term rest then count re-drop
lab@R2-AGG# set term rest then discard
lab@R2-AGG# top
lab@R2-AGG# set interfaces lo0 unit 0 family inet filter input PROTECT-RE</pre>

<h3>Step 2: safety net ke saath commit</h3>
<pre class="code">lab@R2-AGG# show | compare
lab@R2-AGG# commit confirmed 5
commit confirmed will be automatically rolled back in 5 minutes unless confirmed
commit complete
lab@R2-AGG# run show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.12.0.1        ge-0/0/0.0             <span class="hl">Full</span>            10.255.0.1       128    33
10.23.0.2        ge-0/0/1.0             <span class="hl">Full</span>            10.255.0.3       128    37
lab@R2-AGG# commit and-quit
commit complete</pre>
<p>Dono OSPF neighbours <b>Full</b> rehte hain kyunki pehla term OSPF accept karta hai. Tabhi plain commit se confirm karo. Neighbour gir jaye to bas paanch minute ruko aur Junos revert kar dega.</p>

<h3>Step 3: exception traffic, R2 ke loopback ko ping</h3>
<p>PC1 se: <code>ping 10.255.0.2</code>. Yeh packets R2 ke liye hain, to RE tak jaate hain aur lo0 filter se guzarte hain. Phir check karo:</p>
<pre class="out">lab@R2-AGG&gt; show firewall filter PROTECT-RE

Filter: PROTECT-RE
Counters:
Name                                                Bytes              Packets
<span class="hl">re-icmp                                               420                    5</span>
re-drop                                                 0                    0</pre>

<h3>Step 4: transit traffic, R2 ke through SRV ko ping</h3>
<p>PC1 se: <code>ping 10.30.3.10</code>. Yeh packets sirf R2 ka PFE forward karta hai.</p>
<pre class="out">lab@R2-AGG&gt; show pfe statistics traffic
Packet Forwarding Engine traffic statistics:
    Input  packets:                       19                     0 pps
    Output packets:                       19                     0 pps
Packet Forwarding Engine transit traffic (forwarded in hardware):
<span class="hl">    Transit packets forwarded             :                   13</span>
Packet Forwarding Engine local traffic statistics (exception traffic):
    Local packets input                   :                    6
    Local packets output                  :                    6
      of which TTL expired (sent to RE)   :                    1
      of which IP options (sent to RE)    :                    0
    Software input control plane drops    :                    0
    Software input high drops             :                    0
Packet Forwarding Engine hardware discard statistics:
    Timeout                               :                    0
    Normal discard                        :                    0
    Firewall discard                      :                    0
    Fabric drops                          :                    0

lab@R2-AGG&gt; show firewall filter PROTECT-RE
re-icmp                                               420                    5</pre>
<p>Transit packets badhe, lekin <b>re-icmp nahi badha</b>. Lab ke sawal "SRV ke pings se re-icmp kitna badha?" ka jawab <b>0</b> hai. Filter sirf RE ke traffic ko dekhta hai.</p>

<h3>Step 5: TTL expiry, traceroute</h3>
<p>PC1 se: <code>trace 10.30.3.10</code>. TTL 2 wala probe R2 par expire hota hai, to PFE use punt karta hai aur RE ICMP time-exceeded reply bhejta hai. R2 par <code>show pfe statistics traffic</code> check karo: <b>TTL expired (sent to RE)</b> ab kam se kam 1 hai. ICMP time-exceeded replies RE se bahar jaate hain, isliye local output mein ginte hain.</p>
<pre class="out">PC1&gt; trace 10.30.3.10
1   10.10.1.1     0.9 ms
2   10.12.0.2     1.4 ms
3   10.23.0.2     1.9 ms
4   10.30.3.10    2.3 ms</pre>

<div class="eg"><p><b>Results ki vyakhya.</b> Loopback ko ping: counter up, local input up, transit unchanged. SRV ko ping: transit up, counter unchanged. Traceroute: TTL expired up. Saath mein yeh is module ke teen ideas saabit karte hain: transit kabhi RE ko nahi chhuta, local traffic chhuta hai, aur TTL expiry exception traffic hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Discard term ko routing term se pehle rakhna. lo0 interface line set karne se pehle <code>top</code> bhool jaana (aap use filter hierarchy ke neeche set kar doge). Plain commit karke OSPF kho dena aur automatic rollback na hona. SRV ko ping karke counter badalne ki ummeed.</p></div>

<div class="scn"><h4>Auditor ko saabit karna</h4><p>Ek bank ke auditor ne saboot maanga ki router control planes protected hain. Engineer ne lab ki tarah lo0 filter lagaya, user LAN se router ke loopback ko ping kiya aur counter badhta dikhaya; phir router ke through ek server ko ping kiya aur counter ko sthir dikhaya, jabki PFE statistics ne forwarded packets dikhaye. Auditor ne counters ko saboot maan liya ki filter sirf RE-bound traffic ko inspect karta hai aur transit service par asar nahi hai.</p><p><b>Lesson:</b> counters design ke daave ko saboot bana dete hain.</p></div>

<div class="iv"><p class="q">"Production tode bina lo0 filter ke kaam karne ka saboot kaise doge?"</p><p>Commit confirmed se lagao, confirm karo ki routing adjacencies Full hain, phir router ko ping generate karo aur show firewall filter mein counter badhta dekho, aur router ke through ping karke confirm karo ki counter nahi hilta. Transit versus local view ke liye show pfe statistics traffic use karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Filter edit se term by term banao, OSPF term pehle aur discard sabse aakhir mein.</li>
<li>Ise lo0 unit 0 family inet filter input par lagao, aur commit confirmed karo.</li>
<li>Router ko ping ICMP counter badhata hai; router ke through ping nahi.</li>
<li>R2 ke through traffic ke liye transit packets badhte hain; traceroute ke liye TTL expired badhta hai.</li>
<li>Adjacencies Full verify karne ke baad hi commit se confirm karo.</li>
</ul></div>
`}};export{e as default};
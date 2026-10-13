var e=`<svg viewBox="0 0 640 230" role="img" aria-label="Guided lab 2 pipeline: VNet flow log writes to a storage account, Traffic Analytics processes it into a Log Analytics workspace, Connection Monitor tests from vm-app to vm-db">
<rect x="15" y="30" width="130" height="70" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="80" y="60" text-anchor="middle" class="svg-ink" font-size="12">lab-vnet</text><text x="80" y="78" text-anchor="middle" class="svg-muted" font-size="10">vm-app, vm-db</text>
<rect x="195" y="30" width="130" height="70" rx="10" fill="#e2e8f0" stroke="#64748b"/><text x="260" y="60" text-anchor="middle" class="svg-ink" font-size="12">VNet flow log</text><text x="260" y="78" text-anchor="middle" class="svg-muted" font-size="10">in NetworkWatcherRG</text>
<rect x="375" y="30" width="110" height="70" rx="10" fill="#bbf7d0" stroke="#64748b"/><text x="430" y="60" text-anchor="middle" class="svg-ink" font-size="12">Storage</text><text x="430" y="78" text-anchor="middle" class="svg-muted" font-size="10">JSON blobs</text>
<rect x="520" y="30" width="105" height="70" rx="10" fill="#ddd6fe" stroke="#64748b"/><text x="572" y="60" text-anchor="middle" class="svg-ink" font-size="12">Log Analytics</text><text x="572" y="78" text-anchor="middle" class="svg-muted" font-size="10">Traffic Analytics</text>
<line x1="145" y1="65" x2="195" y2="65" stroke="#64748b" stroke-width="2"/><line x1="325" y1="65" x2="375" y2="65" stroke="#64748b" stroke-width="2"/><line x1="485" y1="65" x2="520" y2="65" stroke="#64748b" stroke-width="2"/>
<rect x="195" y="140" width="290" height="50" rx="10" fill="#fde68a" stroke="#64748b"/><text x="340" y="162" text-anchor="middle" class="svg-ink" font-size="12">Connection Monitor: vm-app to vm-db 1433</text><text x="340" y="178" text-anchor="middle" class="svg-muted" font-size="10">results go to the same workspace</text>
<line x1="485" y1="165" x2="572" y2="165" stroke="#64748b" stroke-width="2"/><line x1="572" y1="165" x2="572" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="11">Billing meters: log volume, retention, Traffic Analytics processing, monitor tests</text>
</svg>`,t={id:`guided-lab-flowlogs`,h:{en:`Guided lab on your own Azure account: flow logs, Traffic Analytics and Connection Monitor`,hi:`Apne Azure account par guided lab: flow logs, Traffic Analytics aur Connection Monitor`},body:{en:`
<h3>Goal</h3>
<p>Turn on VNet flow logs for the lab network from the previous chapter, send them to a storage account and a Log Analytics workspace with Traffic Analytics, and create a Connection Monitor test from vm-app to vm-db on port 1433. You will then read the evidence the way a NOC does: who talked to whom, what was allowed, and how latency looks over time. This lab reuses the resource group and VMs from the previous lab; if you already deleted them, recreate the VNet and two VMs first (Steps 1 and 2 of the previous chapter).</p>
<div class="dia">`+e+`<p class="cap">The evidence pipeline. Note that the flow log object itself lives in Network Watcher, not in your resource group.</p></div>

<div class="warn"><p><b>Warning: this lab bills for volume and time.</b> Flow logs, Traffic Analytics, Log Analytics ingestion and Connection Monitor tests all meter continuously while they exist. Traffic Analytics adds processing charges on top of storage and workspace costs. Do it <b>the same day</b>, ideally on a free-credit account, and delete everything at the end. Forgetting it on a busy network is the classic surprise bill.</p></div>

<h3>Prerequisites</h3>
<ul>
<li>The VNet, subnets and two VMs from the previous chapter (rg-nk-ops, lab-vnet, vm-app, vm-db). The deny rule can stay deleted.</li>
<li>Azure CLI signed in. Permission to create a Log Analytics workspace and a storage account.</li>
<li>Important: <b>NSG flow logs are scheduled for retirement</b> and new creation was announced to be blocked (verify the exact dates before publishing). This lab uses <b>VNet flow logs</b>, the successor. Check the current CLI syntax with <code>az network watcher flow-log create --help</code> (verify before publishing).</li>
</ul>

<h3>Honest cost</h3>
<p>Pricing structure (read the current pages before you start): flow log data is billed per GB collected; stored data bills per GB-month plus transactions; Traffic Analytics bills per GB of flow data processed (verify current rates); Log Analytics bills per GB ingested and per GB-month beyond free retention; Connection Monitor bills per test or per check (verify). <b>Every number below is ASSUMED</b>: <b>assumed</b> $0.50 per GB flow data collected, <b>assumed</b> $2.00 per GB processed by Traffic Analytics, <b>assumed</b> $2.50 per GB ingested to the workspace, <b>assumed</b> $0.02 per GB-month storage.</p>
<div class="eg"><p><b>Worked example (assumed rates).</b> The lab network produces about 0.05 GB of flow data in 3 hours. Collection: 0.05 x $0.50 = $0.025. Processing: 0.05 x $2.00 = $0.10. Ingestion: 0.05 x $2.50 = $0.125. Add VMs from the previous lab (about $0.10 for 3 hours). Total about <b>$0.35</b>. Cheap, because the network is almost idle.</p></div>
<div class="warn"><p><b>Warning.</b> The same settings on a production VNet with 200 GB of flow data a month: 200 x ($0.50 + $2.00 + $2.50) = <b>$1,000 per month</b> at these assumed rates. Always size by volume, and consider flow logs only on the subnets you need.</p></div>

<h3>Step 1: storage account and workspace</h3>
<p><b>Portal:</b> create a storage account (Standard LRS, same region) and a Log Analytics workspace named law-nk-ops in centralindia.</p>
<pre class="code">az group create -n rg-nk-ops -l centralindia <span class="c"># skip if it still exists</span>
SA=stnkflow$RANDOM
az storage account create -g rg-nk-ops -n $SA -l centralindia --sku Standard_LRS
az monitor log-analytics workspace create -g rg-nk-ops -n law-nk-ops -l centralindia</pre>

<h3>Step 2: create the VNet flow log with Traffic Analytics</h3>
<p><b>Portal:</b> Network Watcher, Flow logs, Create; choose VNet flow logs; select lab-vnet; select the storage account; set retention small, for example 1 day (verify the retention option); enable Traffic Analytics with a 10 minute processing interval and law-nk-ops (labels unverified).</p>
<pre class="code">VNET=$(az network vnet show -g rg-nk-ops -n lab-vnet --query id -o tsv)
LAW=$(az monitor log-analytics workspace show -g rg-nk-ops -n law-nk-ops --query id -o tsv)
az network watcher flow-log create -l centralindia -n fl-lab-vnet --vnet $VNET --storage-account $SA --workspace $LAW --traffic-analytics true --interval 10 --retention 1</pre>
<p><b>Check:</b> <code>az network watcher flow-log list -l centralindia -o table</code> shows fl-lab-vnet enabled. (Parameter names: verify before publishing.)</p>

<h3>Step 3: generate traffic</h3>
<pre class="code">az vm run-command invoke -g rg-nk-ops -n vm-app --command-id RunShellScript --scripts "for i in 1 2 3 4 5; do nc -zv -w 3 10.1.2.4 1433; sleep 5; done"</pre>
<p>Run it a few times over 10 minutes. Flow data takes time to appear: blobs may lag by minutes, and Traffic Analytics by 10 to 30 minutes or more. Be patient before assuming it is broken.</p>

<h3>Step 4: read the evidence</h3>
<p><b>Raw:</b> in the storage account, browse the flow log container and open a blob to see JSON tuples. <b>Analysed:</b> Network Watcher, Traffic Analytics, or query the workspace in Logs:</p>
<pre class="code">NTANetAnalytics
| where TimeGenerated &gt; ago(1h)
| where SrcIp == "10.1.1.4" and DestIp == "10.1.2.4"
| summarize flows = count() by FlowStatus, DestPort</pre>
<pre class="out"><span class="c">Illustrative output</span>
FlowStatus  DestPort  flows
Allowed     1433      <span class="hl">5</span></pre>
<p>Table and column names vary by flow log type and version (verify before publishing). If you re-add the deny rule you would see a Denied status for the same pair, which is exactly how you prove a block after the fact.</p>

<h3>Step 5: Connection Monitor</h3>
<p><b>Portal:</b> Network Watcher, Connection monitor, Create; add vm-app as the source (needs the Network Watcher agent from the previous lab), vm-db port 1433 as the destination, a TCP test every 60 seconds, workspace law-nk-ops. (Labels unverified.)</p>
<pre class="code">az network watcher connection-monitor create -l centralindia -n cm-app-db --endpoint-source-name src-app --endpoint-source-resource-id $(az vm show -g rg-nk-ops -n vm-app --query id -o tsv) --endpoint-dest-name dst-db --endpoint-dest-address 10.1.2.4 --test-config-name tcp1433 --protocol Tcp --tcp-port 1433 --workspace-ids $LAW</pre>
<p><b>Check:</b> after a few minutes the monitor shows checks passed and a round-trip time. Syntax varies by version (verify before publishing).</p>
<pre class="out"><span class="c">Illustrative output</span>
Test group: tcp1433   Checks failed: <span class="hl">0%</span>   Round-trip time: 1 ms</pre>

<h3>MANDATORY CLEANUP</h3>
<pre class="code">az network watcher connection-monitor delete -l centralindia -n cm-app-db
az network watcher flow-log delete -l centralindia -n fl-lab-vnet
az group delete -n rg-nk-ops --yes --no-wait
az group exists -n rg-nk-ops <span class="c"># repeat until false</span></pre>
<p>Delete the flow log and the monitor <b>explicitly</b>: they belong to Network Watcher in NetworkWatcherRG, so deleting your resource group does not remove them. Then confirm in the portal that Flow logs and Connection monitor are empty and that the workspace is gone.</p>

<h3>What bills you: the trap list</h3>
<ul>
<li>Flow log collection and storage while the flow log exists, plus retention that you forgot to set.</li>
<li>Traffic Analytics processing every interval.</li>
<li>Log Analytics ingestion and retention beyond the free amount.</li>
<li>Connection Monitor tests running every minute, forever.</li>
<li>VMs and disks from the earlier lab.</li>
<li>Flow log objects and monitors orphaned in NetworkWatcherRG after the group is deleted.</li>
</ul>

<div class="scn"><h4>The flow log on the busiest VNet</h4><p>An engineer enabled VNet flow logs with Traffic Analytics on the production hub VNet for a one-day investigation and forgot it. Retention was set to a long period and the workspace had no cap. A month later the bill showed a sharp rise in monitoring costs, far larger than the incident was worth.</p><p><b>Lesson:</b> enable on the narrowest scope, set short retention, add a calendar reminder to disable it, and set a budget alert.</p></div>

<div class="iv"><p class="q">"How do you prove that a connection was blocked yesterday at 3 AM?"</p><p>Live tools only show the present. I use flow logs with Traffic Analytics: query the pair of IPs and ports for that window and look at the allowed or denied status, plus the rule name where logged. Connection Monitor history shows when checks started failing, so I can line the two up with the change log.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flow logs record history; the live tools show only now.</li>
<li>Use VNet flow logs; NSG flow logs are being retired (verify dates).</li>
<li>Expect a delay before data appears.</li>
<li>Volume and retention drive the bill; scope narrowly.</li>
<li>Delete flow logs and monitors explicitly; they live in Network Watcher.</li>
</ul></div>
`,hi:`
<h3>Goal</h3>
<p>Pichhle chapter ke lab network par VNet flow logs on karo, unhe storage account aur Log Analytics workspace mein Traffic Analytics ke saath bhejo, aur vm-app se vm-db port 1433 tak Connection Monitor test banao. Phir NOC ki tarah evidence padho: kisne kis se baat ki, kya allowed tha, aur latency waqt ke saath kaisi hai. Yeh lab pichhle lab ka resource group aur VMs reuse karta hai; agar aap unhe delete kar chuke ho to pehle VNet aur do VMs dobara banao (pichhle chapter ke Step 1 aur 2).</p>
<div class="dia">`+e+`<p class="cap">Evidence pipeline. Dhyan do ki flow log object khud Network Watcher mein rehta hai, aapke resource group mein nahi.</p></div>

<div class="warn"><p><b>Warning: yeh lab volume aur time par bill karta hai.</b> Flow logs, Traffic Analytics, Log Analytics ingestion aur Connection Monitor tests jab tak maujood hain, lagatar meter chalate hain. Traffic Analytics storage aur workspace cost ke upar processing charge jodta hai. Yeh <b>usi din</b> karo, behtar hai free-credit account par, aur ant mein sab delete karo. Busy network par bhoolna classic surprise bill hai.</p></div>

<h3>Prerequisites</h3>
<ul>
<li>Pichhle chapter ka VNet, subnets aur do VMs (rg-nk-ops, lab-vnet, vm-app, vm-db). Deny rule delete hi rehne do.</li>
<li>Azure CLI signed in. Log Analytics workspace aur storage account banane ki permission.</li>
<li>Zaroori: <b>NSG flow logs ki retirement scheduled hai</b> aur naye banana block hone ka announcement tha (exact dates publish se pehle verify karo). Yeh lab uska successor <b>VNet flow logs</b> use karta hai. Current CLI syntax <code>az network watcher flow-log create --help</code> se check karo (verify before publishing).</li>
</ul>

<h3>Imaandar cost</h3>
<p>Pricing ka structure (shuru karne se pehle current pages padho): flow log data per GB collected bill hota hai; stored data per GB-month plus transactions; Traffic Analytics per GB processed flow data (current rates verify karo); Log Analytics per GB ingested aur free retention ke baad per GB-month; Connection Monitor per test ya per check (verify). <b>Neeche ka har number ASSUMED hai</b>: <b>assumed</b> $0.50 per GB flow data collected, <b>assumed</b> $2.00 per GB Traffic Analytics processed, <b>assumed</b> $2.50 per GB workspace ingestion, <b>assumed</b> $0.02 per GB-month storage.</p>
<div class="eg"><p><b>Worked example (assumed rates).</b> Lab network 3 ghante mein lagbhag 0.05 GB flow data banata hai. Collection: 0.05 x $0.50 = $0.025. Processing: 0.05 x $2.00 = $0.10. Ingestion: 0.05 x $2.50 = $0.125. Pichhle lab ki VMs jodo (3 ghante ke lagbhag $0.10). Total lagbhag <b>$0.35</b>. Sasta, kyunki network lagbhag idle hai.</p></div>
<div class="warn"><p><b>Warning.</b> Yahi settings production VNet par jahan mahine mein 200 GB flow data ho: 200 x ($0.50 + $2.00 + $2.50) = <b>$1,000 per month</b> in assumed rates par. Hamesha volume se size karo, aur flow logs sirf zaroori subnets par socho.</p></div>

<h3>Step 1: storage account aur workspace</h3>
<p><b>Portal:</b> storage account (Standard LRS, same region) aur centralindia mein law-nk-ops naam ka Log Analytics workspace banao.</p>
<pre class="code">az group create -n rg-nk-ops -l centralindia <span class="c"># agar abhi bhi exist karta hai to skip karo</span>
SA=stnkflow$RANDOM
az storage account create -g rg-nk-ops -n $SA -l centralindia --sku Standard_LRS
az monitor log-analytics workspace create -g rg-nk-ops -n law-nk-ops -l centralindia</pre>

<h3>Step 2: Traffic Analytics ke saath VNet flow log banao</h3>
<p><b>Portal:</b> Network Watcher, Flow logs, Create; VNet flow logs chuno; lab-vnet chuno; storage account chuno; retention chhoti rakho, jaise 1 din (retention option verify karo); Traffic Analytics ko 10 minute interval aur law-nk-ops ke saath enable karo (labels unverified).</p>
<pre class="code">VNET=$(az network vnet show -g rg-nk-ops -n lab-vnet --query id -o tsv)
LAW=$(az monitor log-analytics workspace show -g rg-nk-ops -n law-nk-ops --query id -o tsv)
az network watcher flow-log create -l centralindia -n fl-lab-vnet --vnet $VNET --storage-account $SA --workspace $LAW --traffic-analytics true --interval 10 --retention 1</pre>
<p><b>Check:</b> <code>az network watcher flow-log list -l centralindia -o table</code> mein fl-lab-vnet enabled dikhe. (Parameter names: publish se pehle verify karo.)</p>

<h3>Step 3: traffic generate karo</h3>
<pre class="code">az vm run-command invoke -g rg-nk-ops -n vm-app --command-id RunShellScript --scripts "for i in 1 2 3 4 5; do nc -zv -w 3 10.1.2.4 1433; sleep 5; done"</pre>
<p>Ise 10 minute mein kuch baar chalao. Flow data aane mein time lagta hai: blobs minutes late ho sakte hain, aur Traffic Analytics 10 se 30 minute ya zyada. Toota hua maanne se pehle sabr rakho.</p>

<h3>Step 4: evidence padho</h3>
<p><b>Raw:</b> storage account mein flow log container browse karo aur blob kholo, JSON tuples dikhenge. <b>Analysed:</b> Network Watcher, Traffic Analytics, ya workspace mein Logs mein query karo:</p>
<pre class="code">NTANetAnalytics
| where TimeGenerated &gt; ago(1h)
| where SrcIp == "10.1.1.4" and DestIp == "10.1.2.4"
| summarize flows = count() by FlowStatus, DestPort</pre>
<pre class="out"><span class="c">Illustrative output</span>
FlowStatus  DestPort  flows
Allowed     1433      <span class="hl">5</span></pre>
<p>Table aur column names flow log type aur version ke hisaab se badalte hain (publish se pehle verify karo). Deny rule dobara lagao to wahi pair Denied status ke saath dikhega, yahi baad mein block saabit karne ka tareeka hai.</p>

<h3>Step 5: Connection Monitor</h3>
<p><b>Portal:</b> Network Watcher, Connection monitor, Create; vm-app ko source jodo (pichhle lab ka Network Watcher agent chahiye), vm-db port 1433 ko destination, har 60 second TCP test, workspace law-nk-ops. (Labels unverified.)</p>
<pre class="code">az network watcher connection-monitor create -l centralindia -n cm-app-db --endpoint-source-name src-app --endpoint-source-resource-id $(az vm show -g rg-nk-ops -n vm-app --query id -o tsv) --endpoint-dest-name dst-db --endpoint-dest-address 10.1.2.4 --test-config-name tcp1433 --protocol Tcp --tcp-port 1433 --workspace-ids $LAW</pre>
<p><b>Check:</b> kuch minute baad monitor checks passed aur round-trip time dikhata hai. Syntax version ke saath badalta hai (publish se pehle verify karo).</p>
<pre class="out"><span class="c">Illustrative output</span>
Test group: tcp1433   Checks failed: <span class="hl">0%</span>   Round-trip time: 1 ms</pre>

<h3>MANDATORY CLEANUP</h3>
<pre class="code">az network watcher connection-monitor delete -l centralindia -n cm-app-db
az network watcher flow-log delete -l centralindia -n fl-lab-vnet
az group delete -n rg-nk-ops --yes --no-wait
az group exists -n rg-nk-ops <span class="c"># false aane tak dohrao</span></pre>
<p>Flow log aur monitor <b>explicitly</b> delete karo: woh NetworkWatcherRG mein Network Watcher ke hain, isliye resource group delete karne se nahi hat'te. Phir portal mein confirm karo ki Flow logs aur Connection monitor khali hain aur workspace gaya.</p>

<h3>What bills you: trap list</h3>
<ul>
<li>Flow log collection aur storage jab tak flow log exist kare, plus retention jo set karna bhool gaye.</li>
<li>Har interval par Traffic Analytics processing.</li>
<li>Free amount ke baad Log Analytics ingestion aur retention.</li>
<li>Connection Monitor tests jo har minute hamesha chalte hain.</li>
<li>Pichhle lab ki VMs aur disks.</li>
<li>Group delete hone ke baad NetworkWatcherRG mein bache orphan flow log objects aur monitors.</li>
</ul>

<div class="scn"><h4>Sabse busy VNet par flow log</h4><p>Ek engineer ne ek din ki investigation ke liye production hub VNet par Traffic Analytics ke saath VNet flow logs on kiye aur bhool gaya. Retention lambi thi aur workspace par koi cap nahi tha. Ek mahine baad bill mein monitoring cost tez badhi, incident ke value se kaafi zyada.</p><p><b>Lesson:</b> sabse chhote scope par on karo, retention chhoti rakho, disable karne ka calendar reminder lagao, aur budget alert set karo.</p></div>

<div class="iv"><p class="q">"Kal raat 3 baje connection block tha, yeh kaise saabit karoge?"</p><p>Live tools sirf abhi ka haal dikhate hain. Main Traffic Analytics wale flow logs use karta hoon: us window ke liye IP aur port ki pair query karta hoon aur allowed ya denied status dekhta hoon, jahan logged ho wahan rule naam bhi. Connection Monitor history batati hai checks kab fail hone lage, phir dono ko change log se milata hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flow logs history record karte hain; live tools sirf abhi dikhate hain.</li>
<li>VNet flow logs use karo; NSG flow logs retire ho rahe hain (dates verify karo).</li>
<li>Data dikhne mein delay expect karo.</li>
<li>Volume aur retention bill chalate hain; scope chhota rakho.</li>
<li>Flow logs aur monitors explicitly delete karo; woh Network Watcher mein rehte hain.</li>
</ul></div>
`}};export{t as default};
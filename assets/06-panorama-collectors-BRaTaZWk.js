var e={id:`panorama-collectors`,h:{en:`Panorama as the destination: collectors and collector groups`,hi:`Panorama destination ke roop mein: collectors aur collector groups`},body:{en:`
<p>Think of a library. Readers (firewalls) bring books (logs). The librarian's desk is where they hand them over, but the books live on shelves in the stacks. Panorama has the same two jobs: it is the place you <b>search</b> logs, and a <b>log collector</b> is where logs are <b>stored</b>. A firewall can hand its logs over only if some shelf is assigned to it.</p>

<h3>Local collector or dedicated Log Collectors</h3>
<table class="tbl"><tr><th>Design</th><th>What it is</th><th>When it fits</th></tr>
<tr><td>Local collector</td><td>The Panorama itself stores the logs</td><td>Small and medium estates, labs, a simple start</td></tr>
<tr><td>Dedicated Log Collectors</td><td>Separate appliances or virtual machines that only store logs</td><td>High volume, long retention, large estates</td></tr>
</table>
<p>Limits such as how many firewalls one collector can serve or how much storage it supports differ by model and version. Check the documentation for your PAN-OS version when sizing. In the simulator, only the local collector exists: dedicated collector appliances and log queries are not modelled.</p>

<h3>Collector groups</h3>
<p>A <b>collector group</b> is a set of one or more collectors that firewalls are assigned to. Without any custom group, every managed firewall forwards to the local collector. The lab shows this default:</p>
<pre class="out">PANO&gt; show log-collector-group all

Group default (local log collector on this Panorama)
    Firewalls: 0079185321121, 0079134988264

PANO&gt; show log-collector all

Name: Panorama (local)
    Status: connected
    Role: local log collector, group default</pre>
<p>The default group already contains both firewalls, which is why the first lab works with no collector setup at all.</p>

<h3>Creating a custom group</h3>
<p>To split firewalls across collectors, or to name a group for a region, you create a group on Panorama and list its collector and firewalls:</p>
<pre class="code">set log-collector-group EAST log-collector Panorama
set log-collector-group EAST devices 0079185321121
commit
commit-all log-collector-config log-collector-group EAST</pre>
<p>Two rules matter. First, the custom group takes effect only after <code>commit-all log-collector-config</code> for that group. A commit alone changes Panorama's own configuration, but the membership has to be pushed. Second, a group with <b>no collector</b> leaves its firewalls unable to deliver: their logs queue on the firewall as waiting. A group without a shelf is a library with no stacks.</p>

<h3>Questions to ask about the destination</h3>
<ul>
<li>Is the firewall connected to the <b>active</b> Panorama? A passive peer in a pair is not the destination.</li>
<li>Which collector group is the firewall in? Is that group's membership pushed?</li>
<li>Does the group have at least one collector that is connected?</li>
</ul>
<p>Panorama can show the answer from its side. The device view gives the collector group, how many logs were received here and how many are still waiting on the firewall:</p>
<pre class="out">PANO&gt; show logging-status device 0079185321121

Device 0079185321121 (NK-PUNE-PA)
    Collector group      : default
    Logs received here   : 2
    Logs created on fw   : 2
    Waiting on firewall  : 0</pre>
<p>Compare the two numbers: received here against created on the firewall. A gap means something is queued or filtered.</p>

<div class="warn"><p><b>Honest boundary.</b> The simulator has no dedicated Log Collector appliances, no log queries by time and no retention settings. It teaches the logic of groups and pushes, which is the same in real deployments.</p></div>

<div class="scn"><h4>The new group with no shelf</h4><p>An engineer created a collector group called WEST for the Chennai firewall, listed the firewall but forgot to add a collector, and pushed the configuration. From that moment Chennai logs stopped appearing on Panorama. The firewall command showed the waiting counter growing. The fix was to add the collector to the group and push the collector configuration.</p><p><b>Lesson:</b> a collector group needs a collector, and membership changes need a collector configuration push.</p></div>

<div class="iv"><p class="q">"What is the difference between Panorama and a Log Collector?"</p><p>Panorama is the management and search interface, and it can also act as a local collector. A Log Collector is the component that actually stores logs; in larger estates it is a dedicated appliance. Firewalls are assigned to collector groups, and group configuration must be pushed for it to take effect.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Panorama is where you search; a collector is where logs are stored.</li>
<li>By default all firewalls use the local collector in the default group.</li>
<li>A custom group works only after a collector configuration push, and needs a collector.</li>
<li>Waiting on firewall means the destination path, not the filter, is the problem.</li>
</ul></div>
`,hi:`
<p>Library socho. Readers (firewalls) kitaabein (logs) laate hain. Librarian ka desk wo jagah hai jahan unhe jama karte hain, lekin kitaabein stacks ki shelves par rehti hain. Panorama ke bhi do kaam hain: wo jagah jahan aap logs <b>search</b> karte ho, aur <b>log collector</b> wo jagah jahan logs <b>store</b> hote hain. Firewall logs tabhi de sakta hai jab uske liye koi shelf assign ho.</p>

<h3>Local collector ya dedicated Log Collectors</h3>
<table class="tbl"><tr><th>Design</th><th>Kya hai</th><th>Kab fit hai</th></tr>
<tr><td>Local collector</td><td>Panorama khud logs store karta hai</td><td>Chhote aur medium estates, labs, simple shuruaat</td></tr>
<tr><td>Dedicated Log Collectors</td><td>Alag appliances ya virtual machines jo sirf logs store karti hain</td><td>High volume, long retention, bade estates</td></tr>
</table>
<p>Ek collector kitne firewalls serve kar sakta hai ya kitna storage support karta hai jaise limits model aur version se badalte hain. Sizing ke waqt apne PAN-OS version ki documentation check karo. Simulator mein sirf local collector hai: dedicated collector appliances aur log queries model nahi hain.</p>

<h3>Collector groups</h3>
<p><b>Collector group</b> ek ya zyada collectors ka set hai jisme firewalls assign hote hain. Koi custom group na ho to har managed firewall local collector ko forward karta hai. Lab ye default dikhata hai:</p>
<pre class="out">PANO&gt; show log-collector-group all

Group default (local log collector on this Panorama)
    Firewalls: 0079185321121, 0079134988264

PANO&gt; show log-collector all

Name: Panorama (local)
    Status: connected
    Role: local log collector, group default</pre>
<p>Default group mein pehle se dono firewalls hain, isliye pehla lab bina collector setup ke chal jata hai.</p>

<h3>Custom group banana</h3>
<p>Firewalls ko collectors mein baantne ke liye, ya region ke naam se group banane ke liye, Panorama par group banao aur uska collector aur firewalls likho:</p>
<pre class="code">set log-collector-group EAST log-collector Panorama
set log-collector-group EAST devices 0079185321121
commit
commit-all log-collector-config log-collector-group EAST</pre>
<p>Do rules matter karte hain. Pehla, custom group us group ke <code>commit-all log-collector-config</code> ke baad hi effect mein aata hai. Sirf commit Panorama ki apni configuration badalta hai, lekin membership push karni padti hai. Doosra, <b>bina collector</b> wala group apne firewalls ko deliver karne nahi deta: unke logs firewall par waiting mein queue ho jate hain. Bina shelf ka group stacks ke bina library hai.</p>

<h3>Destination ke baare mein sawal</h3>
<ul>
<li>Kya firewall <b>active</b> Panorama se connected hai? Pair mein passive peer destination nahi hai.</li>
<li>Firewall kaunse collector group mein hai? Kya us group ki membership push hui?</li>
<li>Kya group mein kam se kam ek connected collector hai?</li>
</ul>
<p>Panorama apni taraf se jawab dikha sakta hai. Device view collector group, yahan kitne logs mile aur kitne firewall par abhi waiting hain batata hai:</p>
<pre class="out">PANO&gt; show logging-status device 0079185321121

Device 0079185321121 (NK-PUNE-PA)
    Collector group      : default
    Logs received here   : 2
    Logs created on fw   : 2
    Waiting on firewall  : 0</pre>
<p>Do numbers compare karo: yahan mile hue aur firewall par bane hue. Gap ka matlab kuch queue mein hai ya filter hua.</p>

<div class="warn"><p><b>Honest boundary.</b> Simulator mein dedicated Log Collector appliances, time ke hisaab se log queries aur retention settings nahi hain. Wo groups aur pushes ka logic sikhata hai, jo real deployments mein bhi same hai.</p></div>

<div class="scn"><h4>Naya group bina shelf ke</h4><p>Ek engineer ne Chennai firewall ke liye WEST naam ka collector group banaya, firewall list kiya lekin collector add karna bhool gaya, aur configuration push kar di. Usi pal se Chennai ke logs Panorama par aana band ho gaye. Firewall command mein waiting counter badhta dikha. Fix: group mein collector add karo aur collector configuration push karo.</p><p><b>Lesson:</b> collector group ko collector chahiye, aur membership changes ko collector configuration push chahiye.</p></div>

<div class="iv"><p class="q">"Panorama aur Log Collector mein kya fark hai?"</p><p>Panorama management aur search interface hai, aur wo local collector ki tarah bhi kaam kar sakta hai. Log Collector wo component hai jo logs actually store karta hai; bade estates mein ye dedicated appliance hota hai. Firewalls collector groups mein assign hote hain, aur group configuration push karni padti hai tabhi effect aata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Panorama wo jagah jahan search karte ho; collector wo jahan logs store hote hain.</li>
<li>Default mein sab firewalls default group ke local collector ko use karte hain.</li>
<li>Custom group collector configuration push ke baad hi chalta hai, aur use collector chahiye.</li>
<li>Waiting on firewall ka matlab destination path problem hai, filter nahi.</li>
</ul></div>
`}};export{e as default};
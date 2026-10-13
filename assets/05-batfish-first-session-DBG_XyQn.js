var e={id:`batfish-first-session`,h:{en:`Batfish: a network model you can ask questions`,hi:`Batfish: network ka model jisse sawaal poochh sakte ho`},body:{en:`
<p>An architect can tell you that a staircase is too steep without building it, because the drawings contain enough to compute the answer. <b>Batfish</b> does that for networks. You give it the configuration files of your routers and switches. It parses them into one vendor-neutral model, works out what the routing would do, and lets you ask questions: are all references defined, which BGP sessions come up, how would a packet travel? No device is logged into and nothing is changed.</p>

<h3>The parts</h3>
<p><b>Batfish</b> is the service that builds the model. <b>pybatfish</b> is the Python client you import. You work with four ideas:</p>
<dl class="terms">
<dt>network</dt><dd>a name for the thing you analyse, here <code>nk-lab</code>. One network can hold many snapshots.</dd>
<dt>snapshot</dt><dd>one set of configs at one moment, uploaded from a folder. We use two: <code>live</code> and <code>candidate</code>.</dd>
<dt>question</dt><dd>a named query such as <code>undefinedReferences</code>, reached as <code>bf.q.undefinedReferences()</code>.</dd>
<dt>answer</dt><dd>what <code>.answer()</code> returns; <code>.frame()</code> turns it into a pandas DataFrame, a table.</dd></dl>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="From config files to a table of answers"><rect x="8" y="36" width="130" height="64" rx="9" fill="#e2e8f0"/><text x="73" y="64" text-anchor="middle" class="svg-ink" font-size="13">configs/</text><text x="73" y="80" text-anchor="middle" class="svg-ink" font-size="13">xe1.cfg j1.cfg e1.cfg</text><rect x="168" y="36" width="110" height="64" rx="9" fill="#bae6fd"/><text x="223" y="64" text-anchor="middle" class="svg-ink" font-size="13">pybatfish</text><text x="223" y="80" text-anchor="middle" class="svg-ink" font-size="13">your script</text><rect x="308" y="36" width="150" height="64" rx="9" fill="#ddd6fe"/><text x="383" y="64" text-anchor="middle" class="svg-ink" font-size="13">Batfish service</text><text x="383" y="80" text-anchor="middle" class="svg-ink" font-size="13">builds the model</text><rect x="488" y="36" width="144" height="64" rx="9" fill="#bbf7d0"/><text x="560" y="64" text-anchor="middle" class="svg-ink" font-size="13">bf.q.question()</text><text x="560" y="80" text-anchor="middle" class="svg-ink" font-size="13">.answer().frame()</text><line x1="138" y1="68" x2="166" y2="68" stroke="#64748b" stroke-width="2"/><polygon points="166,68 157,73 157,63" fill="#64748b"/><line x1="278" y1="68" x2="306" y2="68" stroke="#64748b" stroke-width="2"/><polygon points="306,68 297,73 297,63" fill="#64748b"/><line x1="458" y1="68" x2="486" y2="68" stroke="#64748b" stroke-width="2"/><polygon points="486,68 477,73 477,63" fill="#64748b"/><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">No device is touched. In the lab the service is always on; on real gear it is a container on port 9996.</text></svg><p class="cap">The files are parsed once into a vendor-neutral model; every question reads that model.</p></div>

<h3>The snapshot folder</h3>
<p>Batfish expects a folder with the configs in a sub-folder called <code>configs</code>. File names do not matter, the content does: Batfish recognises the vendor from the text. That is how IOS XE, Junos set-format and EOS sit side by side in one snapshot.</p>
<pre class="out">live/
  configs/
    xe1.cfg     IOS XE
    j1.cfg      Junos (set format)
    e1.cfg      EOS</pre>

<h3>Your first session</h3>
<pre class="code">"""bf_first.py - the first Batfish session: one snapshot, three vendors"""
from pybatfish.client.session import Session
import pandas as pd

pd.set_option("display.width", 200)
pd.set_option("display.max_columns", None)
bf = Session(host="localhost")
print(bf.set_network("nk-lab"))
print(bf.init_snapshot("live", name="live", overwrite=True))
print(bf.list_networks(), bf.list_snapshots())
print(bf.q.fileParseStatus().answer().frame())
print(bf.q.nodeProperties(properties="Configuration_Format").answer().frame())
print(bf.q.ipOwners().answer().frame())
print(bf.q.interfaceProperties(properties="Description|Primary_Address|Active").answer().frame())</pre>
<pre class="out">AUTO01$ python3 bf_first.py
nk-lab
<span class="hl">Successfully initialized snapshot 'live' from 'live'</span>
Default snapshot is now set to live
live
['nk-lab'] ['live']
         File_Name  Status  File_Format    Nodes
<span class="hl">0   configs/e1.cfg  PASSED       ARISTA   ['e1']</span>
<span class="hl">1   configs/j1.cfg  PASSED      JUNIPER   ['j1']</span>
<span class="hl">2  configs/xe1.cfg  PASSED    CISCO_IOS  ['xe1']</span>
   Node  Configuration_Format
<span class="hl">0    e1                ARISTA</span>
<span class="hl">1    j1               JUNIPER</span>
<span class="hl">2   xe1             CISCO_IOS</span>
   Node      VRF           Interface         IP  Mask  Active
0    e1  default           Ethernet1  10.0.13.3    24    True
1    e1  default           Loopback0    3.3.3.3    32    True
2    j1  default          ge-0/0/0.0  10.0.12.2    24    True
3    j1  default               lo0.0    2.2.2.2    32    True
4   xe1  default  GigabitEthernet0/0  10.0.12.1    24    True
5   xe1  default  GigabitEthernet0/1  10.0.13.1    24    True
6   xe1  default           Loopback0    1.1.1.1    32    True
                 Interface  Active  Description  Primary_Address
0            e1[Ethernet1]    True       to-XE1     10.0.13.3/24
1            e1[Loopback0]    True         None       3.3.3.3/32
2             j1[ge-0/0/0]    True       to-XE1             None
3           j1[ge-0/0/0.0]    True         None     10.0.12.2/24
4                  j1[lo0]    True         None             None
5                j1[lo0.0]    True         None       2.2.2.2/32
6  xe1[GigabitEthernet0/0]    True        to-J1     10.0.12.1/24
7  xe1[GigabitEthernet0/1]    True        to-E1     10.0.13.1/24
8           xe1[Loopback0]    True         None       1.1.1.1/32</pre>
<p>Read it in order:</p>
<ul>
<li><code>Session(host="localhost")</code> connects to the service. <code>set_network</code> creates or selects the network; it returns the name.</li>
<li><code>init_snapshot("live", name="live", overwrite=True)</code> uploads the folder. Without <code>overwrite=True</code> a second run fails because the snapshot name already exists. The two messages are what Batfish prints; in the lab they go to the screen.</li>
<li><code>fileParseStatus</code> is the first thing to look at: one row per file, with the vendor Batfish decided on (<code>File_Format</code>) and whether parsing went well. Here all three are <code>PASSED</code>.</li>
<li><code>nodeProperties</code> lists one row per device. Note the node names: <code>xe1</code>, <code>j1</code>, <code>e1</code>. Batfish lower-cases hostnames, so the router called XE1 is <code>xe1</code> in every answer.</li>
<li><code>ipOwners</code> and <code>interfaceProperties</code> show interfaces. Junos has both a physical <code>ge-0/0/0</code> and a logical <code>ge-0/0/0.0</code>; the address lives on the unit.</li>
</ul>

<h3>Questions give tables; tables are Python data</h3>
<p>A frame is a pandas DataFrame, so you filter it with a condition, pick columns with a list, and turn it into plain dictionaries with <code>to_dict("records")</code>. That last call is the bridge to everything else in this module: dictionaries go into deepdiff, into JSON reports and into your own rules.</p>
<p>The two helpers every later script imports sit at the top of <code>bfcheck.py</code>:</p>
<pre class="code">"""bfcheck.py - ask Batfish about a snapshot and turn the answers into plain Python data"""
from pybatfish.client.session import Session

NETWORK = "nk-lab"


def open_session():
    bf = Session(host="localhost")
    bf.set_network(NETWORK)
    return bf


def load(bf, folder):
    """Upload a snapshot folder (it must hold a configs/ folder); the snapshot gets the folder's name."""</pre>
<p>Two snapshots in one network is the trick behind the gate. Every question accepts <code>.answer(snapshot="candidate")</code>, so one script can ask the same question of live and candidate and compare.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab runs a built-in Batfish that is always on. On real gear start the container first: <code>docker run -p 9997:9997 -p 9996:9996 batfish/allinone</code>. Then <code>Session(host="localhost")</code> works there too. Snapshots persist in the lab between scripts, in <code>/tmp/batfish-data</code>. The lab parses IOS and IOS XE, EOS and Junos (set and hierarchical) but not Palo Alto, FRR, Cumulus, F5 or SONiC files. Questions that are not available (<code>layer1Edges</code>, <code>differentialReachability</code>, <code>compareFilters</code>) raise <code>BatfishException</code>. Real Batfish logs its progress messages rather than printing them.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) A folder without <code>configs/</code> inside: Batfish reports that no configs folder was found. (2) Re-uploading a snapshot name without <code>overwrite=True</code>. (3) Asking for <code>XE1</code> when the node is <code>xe1</code>. (4) Reading answers before checking <code>fileParseStatus</code>: if a file did not parse, every later answer is about an incomplete network.</p></div>
<div class="exam"><p><b>Exam trap.</b> Batfish analyses <b>configuration</b>, not live state. It cannot know that a cable is unplugged or an optic is dirty. "BGP session ESTABLISHED" in Batfish means the configs on both sides are compatible and a route to the peer exists, not that the session is up on the devices.</p></div>

<div class="scn"><h4>Half a file</h4><p>An engineer exported configs by copying from a terminal. Pages of <code>--More--</code> prompts ended up inside the files. Batfish still ran, but <code>fileParseStatus</code> showed <code>PARTIALLY_UNRECOGNIZED</code> for four routers and the BGP answers were suspiciously empty. Re-exporting with paging off fixed it.</p><p><b>Lesson:</b> look at <code>fileParseStatus</code> before you believe any other table.</p></div>

<div class="iv"><p class="q">"What is Batfish and what does it need as input?"</p><p>It is an offline network analysis engine. Its input is the configuration files, optionally with extra data such as interface state, uploaded as a snapshot. It builds a vendor-neutral model, computes routing, and answers questions about configuration issues, reachability and differences between snapshots, without touching devices. From Python I use pybatfish.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Batfish reads configs, not devices; pybatfish is its Python client.</li>
<li>Network, snapshot, question and answer are the four ideas.</li>
<li>A snapshot is a folder with a <code>configs</code> sub-folder; vendors are detected from the text.</li>
<li>Check <code>fileParseStatus</code> first; node names are lower case.</li>
<li>Frames are pandas tables: <code>to_dict("records")</code> feeds everything else.</li>
</ul></div>
`,hi:`
<p>Architect bina banaye bata sakta hai ki seedhi bahut khadi hai, kyunki drawings mein jawab nikalne ke liye kaafi hai. <b>Batfish</b> networks ke liye yahi karta hai. Aap use apne routers aur switches ki configuration files dete ho. Woh unhe ek vendor-neutral model mein parse karta hai, nikalta hai ki routing kya karegi, aur aapko sawaal poochhne deta hai: kya saare references defined hain, kaun se BGP sessions up honge, packet kaise chalega? Kisi device mein login nahi hota aur kuch badalta nahi.</p>

<h3>Hisse</h3>
<p><b>Batfish</b> woh service hai jo model banati hai. <b>pybatfish</b> woh Python client hai jise aap import karte ho. Aap chaar ideas ke saath kaam karte ho:</p>
<dl class="terms">
<dt>network</dt><dd>us cheez ka naam jise aap analyse karte ho, yahan <code>nk-lab</code>. Ek network mein kai snapshots ho sakte hain.</dd>
<dt>snapshot</dt><dd>ek pal ke configs ka ek set, folder se upload hua. Hum do use karte hain: <code>live</code> aur <code>candidate</code>.</dd>
<dt>question</dt><dd>naam wala query jaise <code>undefinedReferences</code>, jise <code>bf.q.undefinedReferences()</code> se bulate hain.</dd>
<dt>answer</dt><dd><code>.answer()</code> jo lautata hai; <code>.frame()</code> use pandas DataFrame, yaani table, bana deta hai.</dd></dl>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Config files se jawabon ki table tak"><rect x="8" y="36" width="130" height="64" rx="9" fill="#e2e8f0"/><text x="73" y="64" text-anchor="middle" class="svg-ink" font-size="13">configs/</text><text x="73" y="80" text-anchor="middle" class="svg-ink" font-size="13">xe1.cfg j1.cfg e1.cfg</text><rect x="168" y="36" width="110" height="64" rx="9" fill="#bae6fd"/><text x="223" y="64" text-anchor="middle" class="svg-ink" font-size="13">pybatfish</text><text x="223" y="80" text-anchor="middle" class="svg-ink" font-size="13">aapki script</text><rect x="308" y="36" width="150" height="64" rx="9" fill="#ddd6fe"/><text x="383" y="64" text-anchor="middle" class="svg-ink" font-size="13">Batfish service</text><text x="383" y="80" text-anchor="middle" class="svg-ink" font-size="13">model banata hai</text><rect x="488" y="36" width="144" height="64" rx="9" fill="#bbf7d0"/><text x="560" y="64" text-anchor="middle" class="svg-ink" font-size="13">bf.q.question()</text><text x="560" y="80" text-anchor="middle" class="svg-ink" font-size="13">.answer().frame()</text><line x1="138" y1="68" x2="166" y2="68" stroke="#64748b" stroke-width="2"/><polygon points="166,68 157,73 157,63" fill="#64748b"/><line x1="278" y1="68" x2="306" y2="68" stroke="#64748b" stroke-width="2"/><polygon points="306,68 297,73 297,63" fill="#64748b"/><line x1="458" y1="68" x2="486" y2="68" stroke="#64748b" stroke-width="2"/><polygon points="486,68 477,73 477,63" fill="#64748b"/><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Koi device nahi chhua jaata. Lab mein service hamesha on hai; real gear par woh port 9996 ka container hai.</text></svg><p class="cap">Files ek baar vendor-neutral model mein parse hoti hain; har sawaal usi model ko padhta hai.</p></div>

<h3>Snapshot folder</h3>
<p>Batfish ek aisa folder maangta hai jisme configs <code>configs</code> naam ke sub-folder mein hon. File ke naam matter nahi karte, content karta hai: Batfish text se vendor pehchanta hai. Isi tarah IOS XE, Junos set-format aur EOS ek hi snapshot mein saath baith jaate hain.</p>
<pre class="out">live/
  configs/
    xe1.cfg     IOS XE
    j1.cfg      Junos (set format)
    e1.cfg      EOS</pre>

<h3>Aapka pehla session</h3>
<pre class="code">"""bf_first.py - the first Batfish session: one snapshot, three vendors"""
from pybatfish.client.session import Session
import pandas as pd

pd.set_option("display.width", 200)
pd.set_option("display.max_columns", None)
bf = Session(host="localhost")
print(bf.set_network("nk-lab"))
print(bf.init_snapshot("live", name="live", overwrite=True))
print(bf.list_networks(), bf.list_snapshots())
print(bf.q.fileParseStatus().answer().frame())
print(bf.q.nodeProperties(properties="Configuration_Format").answer().frame())
print(bf.q.ipOwners().answer().frame())
print(bf.q.interfaceProperties(properties="Description|Primary_Address|Active").answer().frame())</pre>
<pre class="out">AUTO01$ python3 bf_first.py
nk-lab
<span class="hl">Successfully initialized snapshot 'live' from 'live'</span>
Default snapshot is now set to live
live
['nk-lab'] ['live']
         File_Name  Status  File_Format    Nodes
<span class="hl">0   configs/e1.cfg  PASSED       ARISTA   ['e1']</span>
<span class="hl">1   configs/j1.cfg  PASSED      JUNIPER   ['j1']</span>
<span class="hl">2  configs/xe1.cfg  PASSED    CISCO_IOS  ['xe1']</span>
   Node  Configuration_Format
<span class="hl">0    e1                ARISTA</span>
<span class="hl">1    j1               JUNIPER</span>
<span class="hl">2   xe1             CISCO_IOS</span>
   Node      VRF           Interface         IP  Mask  Active
0    e1  default           Ethernet1  10.0.13.3    24    True
1    e1  default           Loopback0    3.3.3.3    32    True
2    j1  default          ge-0/0/0.0  10.0.12.2    24    True
3    j1  default               lo0.0    2.2.2.2    32    True
4   xe1  default  GigabitEthernet0/0  10.0.12.1    24    True
5   xe1  default  GigabitEthernet0/1  10.0.13.1    24    True
6   xe1  default           Loopback0    1.1.1.1    32    True
                 Interface  Active  Description  Primary_Address
0            e1[Ethernet1]    True       to-XE1     10.0.13.3/24
1            e1[Loopback0]    True         None       3.3.3.3/32
2             j1[ge-0/0/0]    True       to-XE1             None
3           j1[ge-0/0/0.0]    True         None     10.0.12.2/24
4                  j1[lo0]    True         None             None
5                j1[lo0.0]    True         None       2.2.2.2/32
6  xe1[GigabitEthernet0/0]    True        to-J1     10.0.12.1/24
7  xe1[GigabitEthernet0/1]    True        to-E1     10.0.13.1/24
8           xe1[Loopback0]    True         None       1.1.1.1/32</pre>
<p>Kram se padho:</p>
<ul>
<li><code>Session(host="localhost")</code> service se jodta hai. <code>set_network</code> network banata ya chunta hai; woh naam lautata hai.</li>
<li><code>init_snapshot("live", name="live", overwrite=True)</code> folder upload karta hai. <code>overwrite=True</code> ke bina dusri run fail hoti hai kyunki snapshot ka naam pehle se hai. Do messages Batfish ke print kiye hue hain; lab mein woh screen par aate hain.</li>
<li><code>fileParseStatus</code> sabse pehli cheez hai: har file ke liye ek row, vendor jo Batfish ne tay kiya (<code>File_Format</code>) aur parsing theek hui ya nahi. Yahan teeno <code>PASSED</code> hain.</li>
<li><code>nodeProperties</code> har device ke liye ek row deta hai. Node naam dekho: <code>xe1</code>, <code>j1</code>, <code>e1</code>. Batfish hostnames ko lower case kar deta hai, isliye XE1 naam ka router har answer mein <code>xe1</code> hai.</li>
<li><code>ipOwners</code> aur <code>interfaceProperties</code> interfaces dikhate hain. Junos mein physical <code>ge-0/0/0</code> aur logical <code>ge-0/0/0.0</code> dono hain; address unit par rehta hai.</li>
</ul>

<h3>Questions tables dete hain; tables Python data hain</h3>
<p>Frame pandas DataFrame hai, isliye aap use condition se filter karte ho, list se columns chunte ho, aur <code>to_dict("records")</code> se plain dictionaries bana lete ho. Yeh aakhri call is module ki baaki har cheez ka pul hai: dictionaries deepdiff mein, JSON reports mein aur aapke apne rules mein jaati hain.</p>
<p>Har aage ki script jo do helpers import karti hai woh <code>bfcheck.py</code> ke upar hain:</p>
<pre class="code">"""bfcheck.py - ask Batfish about a snapshot and turn the answers into plain Python data"""
from pybatfish.client.session import Session

NETWORK = "nk-lab"


def open_session():
    bf = Session(host="localhost")
    bf.set_network(NETWORK)
    return bf


def load(bf, folder):
    """Upload a snapshot folder (it must hold a configs/ folder); the snapshot gets the folder's name."""</pre>
<p>Ek network mein do snapshots gate ke peeche ki trick hai. Har question <code>.answer(snapshot="candidate")</code> leta hai, isliye ek script wahi sawaal live aur candidate dono se poochh kar compare kar sakti hai.</p>

<div class="note"><p><b>Lab mein vs real gear par.</b> Lab mein built-in Batfish chalta hai jo hamesha on rehta hai. Real gear par pehle container start karo: <code>docker run -p 9997:9997 -p 9996:9996 batfish/allinone</code>. Phir wahan bhi <code>Session(host="localhost")</code> chalta hai. Lab mein snapshots scripts ke beech <code>/tmp/batfish-data</code> mein bache rehte hain. Lab IOS aur IOS XE, EOS aur Junos (set aur hierarchical) parse karta hai, par Palo Alto, FRR, Cumulus, F5 ya SONiC files nahi. Jo questions available nahi hain (<code>layer1Edges</code>, <code>differentialReachability</code>, <code>compareFilters</code>) woh <code>BatfishException</code> raise karte hain. Real Batfish apne progress messages print nahi, log karta hai.</p></div>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Aisa folder jisme <code>configs/</code> andar nahi: Batfish batata hai ki configs folder nahi mila. (2) Snapshot ka naam <code>overwrite=True</code> ke bina dobara upload karna. (3) Node <code>xe1</code> hai par <code>XE1</code> maangna. (4) <code>fileParseStatus</code> dekhne se pehle answers padhna: agar koi file parse nahi hui, to baad ka har answer adhoore network ke baare mein hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Batfish <b>configuration</b> analyse karta hai, live state nahi. Use nahi pata ki cable nikli hui hai ya optic gandi hai. Batfish mein "BGP session ESTABLISHED" ka matlab hai dono taraf ke configs compatible hain aur peer tak route maujood hai, yeh nahi ki devices par session up hai.</p></div>

<div class="scn"><h4>Aadhi file</h4><p>Ek engineer ne terminal se copy karke configs export kiye. Files ke andar <code>--More--</code> prompts ke pages aa gaye. Batfish phir bhi chala, par chaar routers ke liye <code>fileParseStatus</code> ne <code>PARTIALLY_UNRECOGNIZED</code> dikhaya aur BGP answers shak paida karne waali had tak khaali the. Paging off karke dobara export karne se theek hua.</p><p><b>Lesson:</b> kisi aur table par bharosa karne se pehle <code>fileParseStatus</code> dekho.</p></div>

<div class="iv"><p class="q">"Batfish kya hai aur input mein use kya chahiye?"</p><p>Yeh offline network analysis engine hai. Iska input configuration files hain, kabhi extra data (jaise interface state) ke saath, jo snapshot ki tarah upload hoti hain. Yeh vendor-neutral model banata hai, routing compute karta hai, aur configuration issues, reachability aur snapshots ke beech farak ke sawaalon ka jawab deta hai, devices ko chhuye bina. Python se main pybatfish use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Batfish configs padhta hai, devices nahi; pybatfish uska Python client hai.</li>
<li>Network, snapshot, question aur answer chaar ideas hain.</li>
<li>Snapshot ek folder hai jisme <code>configs</code> sub-folder hota hai; vendor text se pehchana jaata hai.</li>
<li>Pehle <code>fileParseStatus</code> dekho; node ke naam lower case hote hain.</li>
<li>Frames pandas tables hain: <code>to_dict("records")</code> baaki sab ko feed karta hai.</li>
</ul></div>
`}};export{e as default};
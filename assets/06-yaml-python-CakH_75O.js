var e={id:`yaml-python`,h:{en:`YAML in Python: data in one file, code in another`,hi:`Python mein YAML: data ek file mein, code doosri mein`},body:{en:`
<p>This chapter follows lab 2. The story: Kaveri Foods describes its warehouse switches and VLANs in <code>vlans.yml</code>, and <code>build.py</code> turns that data into config for every switch. The big idea is to <b>keep the code and the data apart</b>. When the network grows, you edit only the YAML file and never touch the script.</p>
<h3>Analogy: the recipe and the shopping list</h3>
<p>A recipe (the code) stays the same all year. The shopping list (the data) changes every week. If every shopping change meant rewriting the recipe, cooking would be a nightmare. Network automation is the same: the build script is the recipe, and the YAML file is the list of switches, VLANs and addresses. The file with the data is often called the <b>source of truth</b>.</p>
<h3>Loading YAML</h3>
<p>You need the <code>yaml</code> module (the PyYAML package, already available in the lab). Two functions matter:</p>
<ul>
<li><code>yaml.safe_load(text_or_file)</code>: YAML in, Python dictionaries and lists out.</li>
<li><code>yaml.safe_dump(data)</code>: Python data in, YAML text out.</li>
</ul>
<p>Use <code>safe_load</code>, not the plain <code>load</code>. The safe version builds only ordinary data (text, numbers, lists, dictionaries). The unsafe version can build arbitrary Python objects from a file, which is a security risk when the file comes from somewhere you do not control. Defensive habit: <b>always safe_load</b>.</p>
<h3>The data file</h3>
<p>This is the repaired <code>vlans.yml</code> from the lab. It has one site, two switches and three VLANs.</p>
<h3>The build script</h3>
<p>Read it slowly. The outer loop visits every switch; the inner loop visits every VLAN, so each switch receives all VLANs. The f-strings drop values into the config text.</p>
<p><b>File <code>vlans.yml</code></b></p><pre class="code"># vlans.yml - VLAN plan for the Kaveri Foods warehouse (only data, no code)
site: Nagpur-WH
switches:
  - name: WH-SW1
    mgmt: 10.99.0.11
  - name: WH-SW2
    mgmt: 10.99.0.12
vlans:
  - id: 10
    name: OFFICE
  - id: 20
    name: SCANNERS
  - id: 30
    name: CCTV</pre><pre class="code">import yaml

with open("vlans.yml") as f:
    plan = yaml.safe_load(f)

print("! site:", plan["site"])
for sw in plan["switches"]:
    print(f"! ---- {sw['name']} ({sw['mgmt']}) ----")
    for v in plan["vlans"]:
        print(f"vlan {v['id']}")
        print(f" name {v['name']}")</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">! site: Nagpur-WH
! ---- WH-SW1 (10.99.0.11) ----
vlan 10
 name OFFICE
vlan 20
 name SCANNERS
vlan 30
 name CCTV
! ---- WH-SW2 (10.99.0.12) ----
vlan 10
 name OFFICE
vlan 20
 name SCANNERS
vlan 30
 name CCTV</pre>
<p>Count what happened: 2 switches times 3 VLANs gave 6 <code>vlan</code> blocks. Every switch got the same VLAN list because the list lives once in the data.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Data and code are separate"><rect x="20" y="30" width="181" height="70" rx="10" fill="#bae6fd"/><text x="110" y="60" text-anchor="middle" class="svg-ink" font-size="14">vlans.yml</text><text x="110" y="82" text-anchor="middle" class="svg-muted" font-size="12">the data</text><line x1="203" y1="65" x2="223" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="223,60 229,65 223,70" fill="#64748b"/><rect x="229" y="30" width="181" height="70" rx="10" fill="#bbf7d0"/><text x="319" y="60" text-anchor="middle" class="svg-ink" font-size="14">build.py</text><text x="319" y="82" text-anchor="middle" class="svg-muted" font-size="12">the code</text><line x1="412" y1="65" x2="432" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="432,60 438,65 432,70" fill="#64748b"/><rect x="438" y="30" width="181" height="70" rx="10" fill="#fde68a"/><text x="528" y="60" text-anchor="middle" class="svg-ink" font-size="14">Config</text><text x="528" y="82" text-anchor="middle" class="svg-muted" font-size="12">text for every switch</text></svg><p class="cap">Data and code are separate</p></div>
<h3>Growing the network by editing only the data</h3>
<p>Management asks for VLAN 40 (GUEST) and a third switch, WH-SW3 at 10.99.0.13. In the lab you add four lines to <code>vlans.yml</code> and run <code>build.py</code> again. Here is the extended data, and a smaller report script that counts what each switch now receives.</p>
<p><b>File <code>vlans.yml</code></b></p><pre class="code">site: Nagpur-WH
switches:
  - name: WH-SW1
    mgmt: 10.99.0.11
  - name: WH-SW2
    mgmt: 10.99.0.12
  - name: WH-SW3
    mgmt: 10.99.0.13
vlans:
  - id: 10
    name: OFFICE
  - id: 20
    name: SCANNERS
  - id: 30
    name: CCTV
  - id: 40
    name: GUEST</pre><pre class="code">import yaml

with open("vlans.yml") as f:
    plan = yaml.safe_load(f)

names = [v["name"] for v in plan["vlans"]]
for sw in plan["switches"]:
    print(sw["name"], "gets", len(names), "VLANs:", ", ".join(names))</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">WH-SW1 gets 4 VLANs: OFFICE, SCANNERS, CCTV, GUEST
WH-SW2 gets 4 VLANs: OFFICE, SCANNERS, CCTV, GUEST
WH-SW3 gets 4 VLANs: OFFICE, SCANNERS, CCTV, GUEST</pre>
<p>The script did not change by a single character, yet the output grew from 2 switches and 3 VLANs to 3 switches and 4 VLANs. That is the point of data-driven automation: the change is a data edit that a person can review in a pull request.</p>
<h3>YAML to JSON: same data, different notation</h3>
<p>The monitoring team wants the plan as JSON. Loading with <code>yaml</code> and dumping with <code>json</code> is a two-line conversion. The lab version writes <code>vlans.json</code> with <code>json.dump(plan, f, indent=2)</code>. Here is the same idea shown in memory:</p>
<pre class="code">import json
import yaml

plan = yaml.safe_load("""
site: Nagpur-WH
vlans:
  - id: 10
    name: OFFICE
  - id: 20
    name: SCANNERS
""")
print(json.dumps(plan, indent=2))
print(yaml.safe_dump(plan, default_flow_style=False))</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">{
  "site": "Nagpur-WH",
  "vlans": [
    {
      "id": 10,
      "name": "OFFICE"
    },
    {
      "id": 20,
      "name": "SCANNERS"
    }
  ]
}
site: Nagpur-WH
vlans:
- id: 10
  name: OFFICE
- id: 20
  name: SCANNERS</pre>
<p>Both directions work because both formats describe the same dictionaries and lists. In the lab you then ask the file a question with <code>jq</code>:</p>
<pre class="out">AUTO&gt; json validate vlans.json
vlans.json: valid JSON (object with 3 top-level key(s): site, switches, vlans)

AUTO&gt; jq '.vlans[1].name' vlans.json
"SCANNERS"</pre>
<p>Index 1 is the second VLAN, so the answer is SCANNERS (with quotes, because it is a JSON string).</p>
<h3>If the YAML is broken</h3>
<p>When <code>build.py</code> met the original misaligned file, it did not produce config at all. The lab traceback ends like this:</p>
<pre class="out">AUTO&gt; python3 build.py
Traceback (most recent call last):
  File "build.py", line 6, in &lt;module&gt;
    plan = yaml.safe_load(f)
yaml.YAMLError: bad indentation of a sequence entry (this line is indented more than the list item above it)</pre>
<p>Handle it like any traceback: read the last line, then run <code>yamllint vlans.yml</code> to find line 11 and fix it. Fixing means giving the dash the same two-space indentation as the other items.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Using <code>yaml.load</code> instead of <code>yaml.safe_load</code>. (2) Hard-coding switch names in the script, which defeats the purpose of the data file. (3) Adding a VLAN with the wrong indentation so it silently attaches to the previous item. (4) Forgetting that YAML needs both <code>id</code> and <code>name</code> for every VLAN item, so a missing key later causes <code>KeyError</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> The safe loader is <code>yaml.safe_load</code>. Converting YAML to JSON means load with <code>yaml</code>, dump with <code>json</code>; there is no direct "convert" function. Also: Ansible variable files and inventories are YAML.</p></div>
<div class="scn"><h4>Forty switches, one pull request</h4><p>A campus team generated VLAN config for forty switches from one YAML file and a 30-line script. When the security team requested a new guest VLAN, the change was four lines of YAML in a pull request. Reviewers read exactly what would change, approved it, and the script generated forty configs in seconds. Nobody edited forty files by hand.</p>
<p><b>Lesson:</b> data-driven automation makes a change small, reviewable and repeatable.</p></div>
<div class="iv"><p class="q">"Why separate data from code in automation?"</p><p>Because the logic changes rarely and the data changes often. A YAML file of devices and VLANs can be edited and reviewed by anyone, version-controlled and reused by several tools, while the script stays untouched. It also acts as a source of truth for what the network should look like.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Keep data (YAML) and logic (Python) in separate files.</li>
<li>Always use <code>yaml.safe_load</code>; <code>yaml.safe_dump</code> writes YAML back.</li>
<li>Growing the network means editing the data, not the script.</li>
<li>YAML to JSON: load with <code>yaml</code>, write with <code>json.dump</code>.</li>
<li>A broken YAML file stops <code>yaml.safe_load</code>; use <code>yamllint</code> to find the line.</li>
</ul></div>
`,hi:`
<p>Yeh chapter lab 2 ko follow karta hai. Kahani: Kaveri Foods apne warehouse switches aur VLANs <code>vlans.yml</code> mein likhta hai, aur <code>build.py</code> us data ko har switch ke config mein badalti hai. Bada idea hai <b>code aur data ko alag rakhna</b>. Network badhe to aap sirf YAML file edit karte ho aur script ko kabhi chhute nahi.</p>
<h3>Analogy: recipe aur shopping list</h3>
<p>Recipe (code) saal bhar wahi rehti hai. Shopping list (data) har hafte badalti hai. Har shopping change par recipe dobara likhni padti to khana banana mushkil ho jaata. Network automation bhi aisa hi hai: build script recipe hai, aur YAML file switches, VLANs aur addresses ki list hai. Data wali file ko aksar <b>source of truth</b> kehte hain.</p>
<h3>YAML load karna</h3>
<p>Aapko <code>yaml</code> module chahiye (PyYAML package, lab mein pehle se maujood). Do functions matter karte hain:</p>
<ul>
<li><code>yaml.safe_load(text_or_file)</code>: YAML andar, Python dictionaries aur lists bahar.</li>
<li><code>yaml.safe_dump(data)</code>: Python data andar, YAML text bahar.</li>
</ul>
<p><code>safe_load</code> use karo, plain <code>load</code> nahi. Safe version sirf ordinary data (text, numbers, lists, dictionaries) banata hai. Unsafe version file se arbitrary Python objects bana sakta hai, jo tab security risk hai jab file aisi jagah se aaye jise aap control nahi karte. Defensive aadat: <b>hamesha safe_load</b>.</p>
<h3>Data file</h3>
<p>Yeh lab ki repair ki hui <code>vlans.yml</code> hai. Isme ek site, do switches aur teen VLANs hain.</p>
<p><b>File <code>vlans.yml</code></b></p><pre class="code"># vlans.yml - VLAN plan for the Kaveri Foods warehouse (only data, no code)
site: Nagpur-WH
switches:
  - name: WH-SW1
    mgmt: 10.99.0.11
  - name: WH-SW2
    mgmt: 10.99.0.12
vlans:
  - id: 10
    name: OFFICE
  - id: 20
    name: SCANNERS
  - id: 30
    name: CCTV</pre><pre class="code">import yaml

with open("vlans.yml") as f:
    plan = yaml.safe_load(f)

print("! site:", plan["site"])
for sw in plan["switches"]:
    print(f"! ---- {sw['name']} ({sw['mgmt']}) ----")
    for v in plan["vlans"]:
        print(f"vlan {v['id']}")
        print(f" name {v['name']}")</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">! site: Nagpur-WH
! ---- WH-SW1 (10.99.0.11) ----
vlan 10
 name OFFICE
vlan 20
 name SCANNERS
vlan 30
 name CCTV
! ---- WH-SW2 (10.99.0.12) ----
vlan 10
 name OFFICE
vlan 20
 name SCANNERS
vlan 30
 name CCTV</pre>
<h3>Build script</h3>
<p>Dheere padho. Bahar ka loop har switch par jaata hai; andar ka loop har VLAN par, isliye har switch ko saare VLANs milte hain. f-strings values ko config text mein daalte hain.</p>
<p>Ginti dekho: 2 switches ganya 3 VLANs se 6 <code>vlan</code> blocks bane. Har switch ko wahi VLAN list mili kyunki list data mein ek baar hai.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Data aur code alag hain"><rect x="20" y="30" width="181" height="70" rx="10" fill="#bae6fd"/><text x="110" y="60" text-anchor="middle" class="svg-ink" font-size="14">vlans.yml</text><text x="110" y="82" text-anchor="middle" class="svg-muted" font-size="12">data</text><line x1="203" y1="65" x2="223" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="223,60 229,65 223,70" fill="#64748b"/><rect x="229" y="30" width="181" height="70" rx="10" fill="#bbf7d0"/><text x="319" y="60" text-anchor="middle" class="svg-ink" font-size="14">build.py</text><text x="319" y="82" text-anchor="middle" class="svg-muted" font-size="12">code</text><line x1="412" y1="65" x2="432" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="432,60 438,65 432,70" fill="#64748b"/><rect x="438" y="30" width="181" height="70" rx="10" fill="#fde68a"/><text x="528" y="60" text-anchor="middle" class="svg-ink" font-size="14">Config</text><text x="528" y="82" text-anchor="middle" class="svg-muted" font-size="12">har switch ke liye text</text></svg><p class="cap">Data aur code alag hain</p></div>
<h3>Sirf data edit karke network badhana</h3>
<p>Management VLAN 40 (GUEST) aur teesra switch, WH-SW3 10.99.0.13 par, maangta hai. Lab mein aap <code>vlans.yml</code> mein char lines jodte ho aur <code>build.py</code> dobara chalate ho. Yeh badhaya hua data hai, aur ek chhoti report script jo ginti karti hai ki ab har switch ko kya milta hai.</p>
<p><b>File <code>vlans.yml</code></b></p><pre class="code">site: Nagpur-WH
switches:
  - name: WH-SW1
    mgmt: 10.99.0.11
  - name: WH-SW2
    mgmt: 10.99.0.12
  - name: WH-SW3
    mgmt: 10.99.0.13
vlans:
  - id: 10
    name: OFFICE
  - id: 20
    name: SCANNERS
  - id: 30
    name: CCTV
  - id: 40
    name: GUEST</pre><pre class="code">import yaml

with open("vlans.yml") as f:
    plan = yaml.safe_load(f)

names = [v["name"] for v in plan["vlans"]]
for sw in plan["switches"]:
    print(sw["name"], "gets", len(names), "VLANs:", ", ".join(names))</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">WH-SW1 gets 4 VLANs: OFFICE, SCANNERS, CCTV, GUEST
WH-SW2 gets 4 VLANs: OFFICE, SCANNERS, CCTV, GUEST
WH-SW3 gets 4 VLANs: OFFICE, SCANNERS, CCTV, GUEST</pre>
<p>Script ek akshar bhi nahi badli, phir bhi output 2 switches aur 3 VLANs se 3 switches aur 4 VLANs ho gaya. Data-driven automation ka yahi matlab hai: change ek data edit hai jise koi insaan pull request mein review kar sakta hai.</p>
<h3>YAML se JSON: wahi data, alag notation</h3>
<p>Monitoring team ko plan JSON mein chahiye. <code>yaml</code> se load karke <code>json</code> se dump karna do line ka conversion hai. Lab version <code>json.dump(plan, f, indent=2)</code> se <code>vlans.json</code> likhta hai. Yahan wahi idea memory mein dikhaya gaya hai:</p>
<pre class="code">import json
import yaml

plan = yaml.safe_load("""
site: Nagpur-WH
vlans:
  - id: 10
    name: OFFICE
  - id: 20
    name: SCANNERS
""")
print(json.dumps(plan, indent=2))
print(yaml.safe_dump(plan, default_flow_style=False))</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">{
  "site": "Nagpur-WH",
  "vlans": [
    {
      "id": 10,
      "name": "OFFICE"
    },
    {
      "id": 20,
      "name": "SCANNERS"
    }
  ]
}
site: Nagpur-WH
vlans:
- id: 10
  name: OFFICE
- id: 20
  name: SCANNERS</pre>
<p>Dono directions kaam karti hain kyunki dono formats wahi dictionaries aur lists describe karte hain. Lab mein phir aap <code>jq</code> se file se sawaal poochhte ho:</p>
<pre class="out">AUTO&gt; json validate vlans.json
vlans.json: valid JSON (object with 3 top-level key(s): site, switches, vlans)

AUTO&gt; jq '.vlans[1].name' vlans.json
"SCANNERS"</pre>
<p>Index 1 doosra VLAN hai, isliye jawab SCANNERS hai (quotes ke saath, kyunki yeh JSON string hai).</p>
<h3>Agar YAML toot jaaye</h3>
<p>Jab <code>build.py</code> ko original misaligned file mili, usne config bilkul nahi banaya. Lab ka traceback aise khatam hota hai:</p>
<pre class="out">AUTO&gt; python3 build.py
Traceback (most recent call last):
  File "build.py", line 6, in &lt;module&gt;
    plan = yaml.safe_load(f)
yaml.YAMLError: bad indentation of a sequence entry (this line is indented more than the list item above it)</pre>
<p>Ise kisi bhi traceback ki tarah handle karo: aakhri line padho, phir <code>yamllint vlans.yml</code> chalakar line 11 dhoondho aur fix karo. Fix ka matlab dash ko baaki items jaisi do-space indentation dena.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) <code>yaml.safe_load</code> ki jagah <code>yaml.load</code> use karna. (2) Script mein switch naam hard-code karna, jo data file ka maqsad khatam kar deta hai. (3) VLAN galat indentation se jodna jisse woh chupchaap pichhle item se jud jaata hai. (4) Yeh bhoolna ki har VLAN item ko <code>id</code> aur <code>name</code> dono chahiye, warna baad mein <code>KeyError</code> aata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Safe loader <code>yaml.safe_load</code> hai. YAML se JSON mein convert karne ka matlab <code>yaml</code> se load, <code>json</code> se dump; koi seedha "convert" function nahi hai. Yeh bhi: Ansible variable files aur inventories YAML hain.</p></div>
<div class="scn"><h4>Chalis switches, ek pull request</h4><p>Ek campus team ne chalis switches ka VLAN config ek YAML file aur 30 lines ki script se generate kiya. Security team ne naya guest VLAN maanga to change YAML ki char lines thi, pull request mein. Reviewers ne bilkul wahi padha jo badlega, approve kiya, aur script ne seconds mein chalis configs bana diye. Kisi ne chalis files haath se edit nahi ki.</p>
<p><b>Lesson:</b> data-driven automation change ko chhota, reviewable aur repeatable banata hai.</p></div>
<div class="iv"><p class="q">"Automation mein data ko code se alag kyun rakhte hain?"</p><p>Kyunki logic kam badalta hai aur data zyada. Devices aur VLANs ki YAML file koi bhi edit aur review kar sakta hai, version-control mein rakh sakta hai aur kai tools reuse kar sakte hain, jabki script chhuyi nahi jaati. Woh network kaisa dikhna chahiye iske liye source of truth ka kaam bhi karti hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data (YAML) aur logic (Python) alag files mein rakho.</li>
<li>Hamesha <code>yaml.safe_load</code> use karo; <code>yaml.safe_dump</code> YAML wapas likhta hai.</li>
<li>Network badhana matlab data edit karna, script nahi.</li>
<li>YAML se JSON: <code>yaml</code> se load, <code>json.dump</code> se likho.</li>
<li>Toota hua YAML file <code>yaml.safe_load</code> ko rok deta hai; line dhoondhne ke liye <code>yamllint</code> use karo.</li>
</ul></div>
`}};export{e as default};
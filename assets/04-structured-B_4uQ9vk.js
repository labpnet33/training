var e=(e,t)=>`<div class="dia">`+e+`<p class="cap">`+t+`</p></div>`,t=`<svg viewBox="0 0 640 150" role="img" aria-label="From command output to a list of dictionaries">
<rect x="10" y="40" width="150" height="60" rx="8" fill="#bae6fd"/><text x="85" y="66" text-anchor="middle" class="svg-ink" font-size="13">Response.result</text><text x="85" y="84" text-anchor="middle" class="svg-muted" font-size="11">plain text</text>
<rect x="245" y="40" width="150" height="60" rx="8" fill="#fde68a"/><text x="320" y="66" text-anchor="middle" class="svg-ink" font-size="13">TextFSM template</text><text x="320" y="84" text-anchor="middle" class="svg-muted" font-size="11">cisco_ios_show_ip_...</text>
<rect x="480" y="40" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="555" y="66" text-anchor="middle" class="svg-ink" font-size="13">list of dicts</text><text x="555" y="84" text-anchor="middle" class="svg-muted" font-size="11">or [] if no match</text>
<line x1="160" y1="70" x2="245" y2="70" stroke="#64748b" stroke-width="2"/><line x1="395" y1="70" x2="480" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">textfsm_parse_output()</text>
</svg>`,n={id:`structured`,h:{en:`Structured output: TextFSM and the interface table`,hi:`Structured output: TextFSM aur interface table`},body:{en:`
<p><b>The idea of this chapter:</b> text is for humans, lists of dictionaries are for scripts. scrapli gives every Response a method that runs the output through a TextFSM template from ntc-templates, the same templates you used in <code>py-textfsm</code> and in adv-nkmiko.</p>

<h3>textfsm_parse_output()</h3>
`+e(t,`The platform and the command pick the template. No template, or no match, gives an empty list and no error.`)+`
<p>On real gear you install the extra (<code>pip install scrapli[textfsm]</code>), which brings TextFSM and ntc-templates. scrapli chooses the template from its <code>textfsm_platform</code> (for IOS XE that is <code>cisco_ios</code>) and the command you sent, so <code>show ip interface brief</code> on IOS XE finds <code>cisco_ios_show_ip_interface_brief</code>. Nothing else to configure.</p>
<pre class="code">from scrapli import Scrapli
from scrapli.exceptions import ScrapliException

common = {"auth_username": "netops", "auth_password": "NK@2026", "auth_secondary": "NK@2026", "auth_strict_key": False}
with Scrapli(platform="cisco_iosxe", host="10.99.0.1", **common) as conn:
    r = conn.send_command("show ip interface brief")
    rows = r.textfsm_parse_output()
    print(rows[0])
    print(r.textfsm_parse_output(to_dict=False)[0])
    print(conn.send_command("show bogus").textfsm_parse_output())
    try:
        r.genie_parse_output()
    except ScrapliException as err:
        print(type(err).__name__, err)

with Scrapli(platform="arista_eos", host="10.99.0.21", **common) as conn:
    print(conn.send_command("show ip interface brief").textfsm_parse_output()[0])

with Scrapli(platform="juniper_junos", host="10.99.0.11", **common) as conn:
    print(conn.send_command("show interfaces terse").textfsm_parse_output())</pre>
<pre class="out">AUTO01$ python3 ch4.py
{'interface': 'GigabitEthernet0/0', 'ip_address': '10.99.0.1', 'status': 'up', 'proto': 'up'}
['GigabitEthernet0/0', '10.99.0.1', 'up', 'up']
[]
ScrapliException genie is not installed (pip install scrapli[genie])
{'interface': 'Ethernet1', 'ip_address': '10.99.0.21/24', 'status': 'up', 'protocol': 'up', 'mtu': '1500'}
[]</pre>
<p>Read the output in order. The first line is one row from R1 as a dictionary, with the key <code>proto</code>. The second line is the same row as a plain list, because of <code>to_dict=False</code>. The third line is the parse of a <b>failed</b> command: an empty list, not an exception. Then <code>genie_parse_output()</code> raises <code>ScrapliException</code> in the lab, because Genie is not installed (on real gear it needs <code>scrapli[genie]</code>). Then one row from Arista: the same idea but the key is <code>protocol</code>, the address carries its prefix length (<code>10.99.0.21/24</code>) and there is an extra key, <code>mtu</code>. The last line is the parse of Junos <code>show interfaces terse</code>: an empty list again.</p>

<h3>Three rules for parsed output</h3>
<ol>
<li><b>Never assume keys are the same across vendors.</b> Cisco says <code>proto</code>, Arista says <code>protocol</code>. Put the difference in one small function per platform.</li>
<li><b>An empty list means "no template or no match", not "no interfaces".</b> Test for it. In adv-nkmiko, <code>use_textfsm=True</code> returned the raw text when parsing failed; here you get <code>[]</code>, which is easier to test: <code>if not rows:</code>.</li>
<li><b>Have a fallback.</b> When there is no template, a short regular expression on <code>response.result</code> is fine. The lab returns <code>[]</code> for Junos <code>show interfaces terse</code>, so Lab 1 parses it with a regex.</li>
</ol>

<h3>Lab 1, task 4: interfaces.py</h3>
<p>One command per platform, TextFSM for Cisco and Arista, a regex for Junos, one printed table and one CSV file.</p>
<pre class="code">import csv
import re

from tabulate import tabulate
from common import collect

SHOW = {
    "cisco_iosxe": "show ip interface brief",
    "arista_eos": "show ip interface brief",
    "juniper_junos": "show interfaces terse",
}
JUNOS = re.compile(r"^(\\S+)\\s+(up|down)\\s+(up|down)\\s+inet\\s+(\\S+)")


def job(row, conn):
    result = conn.send_command(SHOW[row["platform"]])
    out = []
    if row["platform"] == "juniper_junos":
        for line in result.result.splitlines():
            m = JUNOS.match(line)
            if m:
                state = "up" if m.group(2) == "up" and m.group(3) == "up" else "down"
                out.append([row["name"], m.group(1), m.group(4).split("/")[0], state])
        return out
    for r in result.textfsm_parse_output():
        if r["ip_address"] in ("", "unassigned"):
            continue
        proto = r["proto"] if "proto" in r else r["protocol"]
        state = "up" if r["status"] == "up" and proto == "up" else "down"
        out.append([row["name"], r["interface"], r["ip_address"].split("/")[0], state])
    return out


if __name__ == "__main__":
    rows = []
    for part in collect(job).values():
        rows += part
    head = ["device", "interface", "ip", "state"]
    print(tabulate(rows, headers=head))
    with open("interfaces.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(head)
        w.writerows(rows)
    print(f"{len(rows)} interfaces written to interfaces.csv")</pre>
<pre class="out">AUTO01$ python3 interfaces.py
DEAD1  unreachable
device    interface           ip          state
--------  ------------------  ----------  -------
R1        GigabitEthernet0/0  10.99.0.1   up
R1        Loopback0           1.1.1.1     up
<span class="hl">J1        ge-0/0/0.0          10.99.0.11  up</span>
<span class="hl">J1        lo0.0               2.2.2.2     up</span>
<span class="hl">J1        lo0.16384           127.0.0.1   up</span>
E1        Ethernet1           10.99.0.21  up
E1        Loopback0           3.3.3.3     up
7 interfaces written to interfaces.csv</pre>
<p>The highlighted rows are the J1 rows the lab asks you to count: <code>ge-0/0/0.0</code>, <code>lo0.0</code> and <code>lo0.16384</code>, the internal loopback of Junos. The DEAD1 line comes first because it is printed while the devices are collected, before the table. The regex insists on <code>inet</code> in the fourth column, so interfaces without an address are skipped, just as the Cisco branch skips <code>unassigned</code>. The rule for "is it up" differs per vendor: Cisco and Arista need status and protocol both up; on Junos the admin and link columns both must say <code>up</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> Indexing <code>rows[0]</code> without testing for an empty list. Using the Cisco key names on Arista output. Parsing the output of a <b>failed</b> command and getting an empty table that looks like "no interfaces". Calling <code>textfsm_parse_output()</code> without the extra installed on real gear: you get an exception that tells you to install it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Parsing happens on the computer that runs the script, on exactly the text the device returned. If you filter on the device (<code>show ip interface brief | include up</code>) you parse only the filtered rows: in the lab that is 2 rows instead of 5. Filter in Python instead, so the same command and the same code work on every vendor.</p></div>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab parses through its own transport using the real ntc-templates, so the keys you see are the real ones. Whether a template exists for a given command on a given platform is decided by ntc-templates; the lab shows none for Junos <code>show interfaces terse</code>. Genie parsing is not available in the lab.</p></div>

<div class="scn"><h4>The empty table nobody questioned</h4><p>A report script built a "interfaces up" count from parsed output and printed 0 for an Arista switch every morning. The cause was a typo in the command, so the parse of the error text returned an empty list. The script treated an empty list as "nothing is up" and the weekly summary said the switch had been dead for a month. The fix was two lines: check <code>response.failed</code> first, then check for an empty list and raise an alert.</p><p><b>Lesson:</b> empty is not the same as zero.</p></div>

<div class="iv"><p class="q">"How do you get structured data from a scrapli session?"</p><p><code>response.textfsm_parse_output()</code> gives a list of dictionaries from ntc-templates, chosen by platform and command. If it returns an empty list I check <code>failed</code> first, then fall back to a regular expression, or to NETCONF or an API where the platform offers one.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>textfsm_parse_output()</code> returns a list of dictionaries; <code>to_dict=False</code> returns lists.</li>
<li>No template or no match gives <code>[]</code>, never an exception; test for it.</li>
<li>Key names differ per vendor: <code>proto</code> on Cisco, <code>protocol</code> on Arista.</li>
<li>Use a regex fallback when no template exists, as Lab 1 does for Junos.</li>
<li>Check <code>failed</code> before you trust parsed output.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> text insaanon ke liye hai, dictionaries ki lists scripts ke liye. scrapli har Response ko ek method deta hai jo output ko ntc-templates ke TextFSM template se guzarta hai, wahi templates jo aapne <code>py-textfsm</code> aur adv-nkmiko mein use kiye.</p>

<h3>textfsm_parse_output()</h3>
`+e(t,`Platform aur command template chunte hain. Template nahi ya match nahi to khaali list milti hai, error nahi.`)+`
<p>Real gear par aap extra install karte ho (<code>pip install scrapli[textfsm]</code>), jo TextFSM aur ntc-templates laata hai. scrapli template apne <code>textfsm_platform</code> (IOS XE ke liye <code>cisco_ios</code>) aur aapki bheji command se chunta hai, isliye IOS XE par <code>show ip interface brief</code> ko <code>cisco_ios_show_ip_interface_brief</code> mil jaata hai. Aur kuch configure nahi karna.</p>
<pre class="code">from scrapli import Scrapli
from scrapli.exceptions import ScrapliException

common = {"auth_username": "netops", "auth_password": "NK@2026", "auth_secondary": "NK@2026", "auth_strict_key": False}
with Scrapli(platform="cisco_iosxe", host="10.99.0.1", **common) as conn:
    r = conn.send_command("show ip interface brief")
    rows = r.textfsm_parse_output()
    print(rows[0])
    print(r.textfsm_parse_output(to_dict=False)[0])
    print(conn.send_command("show bogus").textfsm_parse_output())
    try:
        r.genie_parse_output()
    except ScrapliException as err:
        print(type(err).__name__, err)

with Scrapli(platform="arista_eos", host="10.99.0.21", **common) as conn:
    print(conn.send_command("show ip interface brief").textfsm_parse_output()[0])

with Scrapli(platform="juniper_junos", host="10.99.0.11", **common) as conn:
    print(conn.send_command("show interfaces terse").textfsm_parse_output())</pre>
<pre class="out">AUTO01$ python3 ch4.py
{'interface': 'GigabitEthernet0/0', 'ip_address': '10.99.0.1', 'status': 'up', 'proto': 'up'}
['GigabitEthernet0/0', '10.99.0.1', 'up', 'up']
[]
ScrapliException genie is not installed (pip install scrapli[genie])
{'interface': 'Ethernet1', 'ip_address': '10.99.0.21/24', 'status': 'up', 'protocol': 'up', 'mtu': '1500'}
[]</pre>
<p>Output ko kram se padho. Pehli line R1 ki ek row hai dictionary ke roop mein, key <code>proto</code> ke saath. Doosri line wahi row plain list ke roop mein, <code>to_dict=False</code> ki wajah se. Teesri line ek <b>failed</b> command ka parse hai: khaali list, exception nahi. Phir lab mein <code>genie_parse_output()</code> <code>ScrapliException</code> raise karta hai, kyunki Genie install nahi hai (real gear par <code>scrapli[genie]</code> chahiye). Phir Arista ki ek row: wahi idea par key <code>protocol</code> hai, address apni prefix length ke saath aata hai (<code>10.99.0.21/24</code>) aur ek extra key <code>mtu</code> hai. Aakhri line Junos <code>show interfaces terse</code> ka parse hai: phir khaali list.</p>

<h3>Parsed output ke teen niyam</h3>
<ol>
<li><b>Kabhi mat maano ki keys vendors mein ek jaisi hain.</b> Cisco <code>proto</code> kehta hai, Arista <code>protocol</code>. Farak ko har platform ke liye ek chhote function mein rakho.</li>
<li><b>Khaali list ka matlab "template nahi ya match nahi" hai, "interfaces nahi" nahi.</b> Use test karo. adv-nkmiko mein parsing fail hone par <code>use_textfsm=True</code> raw text lautata tha; yahan <code>[]</code> milta hai, jise test karna aasan hai: <code>if not rows:</code>.</li>
<li><b>Fallback rakho.</b> Template na ho to <code>response.result</code> par chhota regular expression theek hai. Lab Junos <code>show interfaces terse</code> ke liye <code>[]</code> deta hai, isliye Lab 1 use regex se parse karta hai.</li>
</ol>

<h3>Lab 1, task 4: interfaces.py</h3>
<p>Har platform ke liye ek command, Cisco aur Arista ke liye TextFSM, Junos ke liye regex, ek printed table aur ek CSV file.</p>
<pre class="code">import csv
import re

from tabulate import tabulate
from common import collect

SHOW = {
    "cisco_iosxe": "show ip interface brief",
    "arista_eos": "show ip interface brief",
    "juniper_junos": "show interfaces terse",
}
JUNOS = re.compile(r"^(\\S+)\\s+(up|down)\\s+(up|down)\\s+inet\\s+(\\S+)")


def job(row, conn):
    result = conn.send_command(SHOW[row["platform"]])
    out = []
    if row["platform"] == "juniper_junos":
        for line in result.result.splitlines():
            m = JUNOS.match(line)
            if m:
                state = "up" if m.group(2) == "up" and m.group(3) == "up" else "down"
                out.append([row["name"], m.group(1), m.group(4).split("/")[0], state])
        return out
    for r in result.textfsm_parse_output():
        if r["ip_address"] in ("", "unassigned"):
            continue
        proto = r["proto"] if "proto" in r else r["protocol"]
        state = "up" if r["status"] == "up" and proto == "up" else "down"
        out.append([row["name"], r["interface"], r["ip_address"].split("/")[0], state])
    return out


if __name__ == "__main__":
    rows = []
    for part in collect(job).values():
        rows += part
    head = ["device", "interface", "ip", "state"]
    print(tabulate(rows, headers=head))
    with open("interfaces.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(head)
        w.writerows(rows)
    print(f"{len(rows)} interfaces written to interfaces.csv")</pre>
<pre class="out">AUTO01$ python3 interfaces.py
DEAD1  unreachable
device    interface           ip          state
--------  ------------------  ----------  -------
R1        GigabitEthernet0/0  10.99.0.1   up
R1        Loopback0           1.1.1.1     up
<span class="hl">J1        ge-0/0/0.0          10.99.0.11  up</span>
<span class="hl">J1        lo0.0               2.2.2.2     up</span>
<span class="hl">J1        lo0.16384           127.0.0.1   up</span>
E1        Ethernet1           10.99.0.21  up
E1        Loopback0           3.3.3.3     up
7 interfaces written to interfaces.csv</pre>
<p>Highlighted rows woh J1 rows hain jinhe lab gin-ne ko kehta hai: <code>ge-0/0/0.0</code>, <code>lo0.0</code> aur <code>lo0.16384</code>, Junos ka internal loopback. DEAD1 line pehle aati hai kyunki woh devices collect hote waqt print hoti hai, table se pehle. Regex chauthe column mein <code>inet</code> maangta hai, isliye bina address wale interfaces skip hote hain, bilkul jaise Cisco branch <code>unassigned</code> skip karti hai. "Up hai ya nahi" ka niyam vendor ke hisaab se alag hai: Cisco aur Arista mein status aur protocol dono up chahiye; Junos par admin aur link columns dono <code>up</code> kahein.</p>

<div class="warn"><p><b>Aam galtiyan.</b> Khaali list test kiye bina <code>rows[0]</code> index karna. Arista output par Cisco ke key naam use karna. Ek <b>failed</b> command ka output parse karke khaali table paana jo "interfaces nahi" jaisa dikhe. Real gear par extra install kiye bina <code>textfsm_parse_output()</code> bulana: aapko exception milta hai jo install karne ko kehta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Parsing us computer par hoti hai jo script chalata hai, bilkul us text par jo device ne lautaya. Agar aap device par filter karte ho (<code>show ip interface brief | include up</code>) to sirf filtered rows parse hoti hain: lab mein 5 ki jagah 2 rows. Filter Python mein karo, taaki wahi command aur wahi code har vendor par chale.</p></div>

<div class="note"><p><b>Lab mein vs real gear par.</b> Lab apne transport se asli ntc-templates use karke parse karta hai, isliye jo keys dikhti hain woh asli hain. Kisi platform par kisi command ka template hai ya nahi, yeh ntc-templates tay karta hai; lab Junos <code>show interfaces terse</code> ke liye koi nahi dikhata. Lab mein Genie parsing available nahi hai.</p></div>

<div class="scn"><h4>Khaali table jise kisi ne sawaal nahi kiya</h4><p>Ek report script parsed output se "interfaces up" count banati thi aur har subah Arista switch ke liye 0 print karti thi. Wajah command mein typo thi, isliye error text ke parse ne khaali list di. Script ne khaali list ko "kuch up nahi" maana aur weekly summary ne kaha ki switch ek mahine se dead hai. Fix do lines ka tha: pehle <code>response.failed</code> check karo, phir khaali list check karo aur alert raise karo.</p><p><b>Lesson:</b> khaali aur zero ek cheez nahi.</p></div>

<div class="iv"><p class="q">"scrapli session se structured data kaise lete ho?"</p><p><code>response.textfsm_parse_output()</code> ntc-templates se dictionaries ki list deta hai, platform aur command ke hisaab se chuna hua. Agar khaali list aaye to pehle <code>failed</code> check karta hoon, phir regular expression par fallback, ya NETCONF ya API jahan platform deta ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>textfsm_parse_output()</code> dictionaries ki list lautata hai; <code>to_dict=False</code> lists lautata hai.</li>
<li>Template nahi ya match nahi to <code>[]</code>, exception kabhi nahi; test karo.</li>
<li>Key naam vendor ke hisaab se alag: Cisco par <code>proto</code>, Arista par <code>protocol</code>.</li>
<li>Template na ho to regex fallback use karo, jaise Lab 1 Junos ke liye karta hai.</li>
<li>Parsed output par bharosa karne se pehle <code>failed</code> check karo.</li>
</ul></div>
`}};export{n as default};
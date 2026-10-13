var e={id:`reports`,h:{en:`From parsed data to a CSV report`,hi:`Parsed data se CSV report tak`},body:{en:`
<p>Parsing is only half of a collection script. The other half is <b>delivering</b> the result: a file that a manager, an auditor or a spreadsheet can use. The most common delivery format is <b>CSV</b> (comma-separated values): plain text, one row per line, fields separated by commas. Excel and Google Sheets open it directly. This chapter finishes lab 2, where <code>inv.py</code> writes <code>inventory.csv</code>.</p>
<h3>What a CSV file looks like</h3>
<p>A CSV is just text. The first line is the <b>header</b> with the column names. Every other line is one record, with the same number of fields.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="From parsing to a report"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Raw text</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">show version</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Values</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">host, version, uptime, serial</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">Rows</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">one string per router</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">File</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">inventory.csv</text></svg><p class="cap">From parsing to a report</p></div>
<h3>Method 1: build the lines yourself</h3>
<p>For a small job you can build each line with an f-string and join the lines with a new-line character. This is what the lab does. The example uses three fixed rows so that it runs anywhere.</p>
<pre class="code">rows = ["hostname,version,uptime,serial"]
rows.append("BLR-CORE,2.0,0 minutes,NK3C15U4X00")
rows.append("BLR-WAN,2.0,0 minutes,NK45ZYX1X00")

with open("inventory.csv", "w") as f:
    f.write("\\n".join(rows) + "\\n")

with open("inventory.csv") as f:
    text = f.read()
print(text)
print("Lines in file:", len(text.splitlines()))</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">hostname,version,uptime,serial
BLR-CORE,2.0,0 minutes,NK3C15U4X00
BLR-WAN,2.0,0 minutes,NK45ZYX1X00

Lines in file: 3</pre>
<p>Three details matter. <code>"w"</code> opens the file for <b>writing</b> and <b>replaces</b> an old file of the same name. <code>"\\n".join(rows)</code> puts a new line <b>between</b> rows, so you add one more <code>"\\n"</code> at the end to finish the last line. The <code>with</code> block closes the file for you, which is what makes sure that the data is really saved.</p>
<h3>The comma problem</h3>
<p>Method 1 has one weakness: a value that <b>contains a comma</b> splits into two columns. A location such as <code>Andheri, Mumbai</code> would shift every column after it. The standard <code>csv</code> module solves this by putting quotes around such a value.</p>
<pre class="code">import csv
import io

buffer = io.StringIO()
writer = csv.writer(buffer, lineterminator="\\n")
writer.writerow(["hostname", "location"])
writer.writerow(["MUM-R1", "Andheri, Mumbai"])
writer.writerow(["BLR-CORE", "Bengaluru"])
print(buffer.getvalue())

rows = list(csv.reader(io.StringIO(buffer.getvalue())))
print(rows[1])
print(len(rows[1]), "fields")</pre><p><i>Reference code (not run in the simulator). Output below is from standard Python 3.</i></p><pre class="out">hostname,location
MUM-R1,"Andheri, Mumbai"
BLR-CORE,Bengaluru

['MUM-R1', 'Andheri, Mumbai']
2 fields</pre>
<p>The second row is written with quotes around <code>Andheri, Mumbai</code>, and reading it back gives <b>two</b> fields, not three. Use the <code>csv</code> module whenever data comes from people or from free text. For serial numbers and versions Method 1 is enough. For the same job with dictionaries, <code>csv.DictWriter</code> writes a list of dictionaries and picks the columns from the keys.</p>
<h3>Finishing lab 2</h3>
<p>In lab 2, <code>inv.py</code> already has patterns for the hostname, the version and the uptime. The two open tasks are the serial number and the file. After fixing the <code>Version</code> spelling, this is the finished script and its real output in the lab:</p>
<pre class="code">import re
from nkmiko import ConnectHandler

ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]
rows = ["hostname,version,uptime,serial"]

for ip in ROUTERS:
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    out = conn.send_command("show version")
    conn.disconnect()
    host = re.search(r"(\\S+) uptime is", out).group(1)
    version = re.search(r"Version (\\S+),", out).group(1)
    uptime = re.search(r"uptime is (.+)", out).group(1)
    serial = re.search(r"Processor board ID (\\S+)", out).group(1)
    rows.append(f"{host},{version},{uptime},{serial}")

with open("inventory.csv", "w") as f:
    f.write("\\n".join(rows) + "\\n")

print("Wrote", len(rows) - 1, "routers to inventory.csv")
print(open("inventory.csv").read())</pre><p><i>Run in the lab terminal (it uses the lab routers). Output captured from the simulator.</i></p><pre class="out">Wrote 3 routers to inventory.csv
hostname,version,uptime,serial
BLR-CORE,2.0,0 minutes,NK3C15U4X00
BLR-WAN,2.0,0 minutes,NK45ZYX1X00
BLR-LAB,2.0,0 minutes,NK3W0D82X00</pre>
<p>The serial number of BLR-WAN, the lab answer, is <code>NK45ZYX1X00</code>. Check the file with the same discipline as any report: header present, one row per router, no row with <code>TODO</code> left in it.</p>
<h3>Other report shapes</h3>
<p>A CSV is flat: one row per device. When a record has lists inside it, such as several VLANs per switch, JSON from the previous module is the better file. In both cases the idea is the same: <b>collect, parse, store the result, then report from the stored data</b>. A small script that reads <code>inventory.csv</code> back can answer questions such as "which routers run an older version?" without logging in to a single device again.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Opening the file with <code>"w"</code> when you meant to add rows; <code>"w"</code> erases the old content, <code>"a"</code> appends. (2) Forgetting the final new line, so the next tool glues two records together. (3) Leaving the placeholder <code>TODO</code> in a column and shipping the report. (4) Putting values with commas into Method 1 lines. (5) Writing the report before checking that every pattern matched.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>json.dump</code> writes to a file object; <code>json.dumps</code> returns a string. For CSV, the <code>csv</code> module handles quoting; joining with commas does not. Opening a file with <code>"w"</code> truncates it.</p></div>
<div class="scn"><h4>The inventory with a shifted column</h4><p>A team exported a switch inventory with joined strings. One location field held <code>Floor 3, Annexe</code>. In Excel every row below it shifted one column to the right, and the serial numbers appeared under the uptime heading. Nobody noticed for a week, until an audit compared serials with purchase records. Switching to the <code>csv</code> module added the quotes and the audit passed.</p>
<p><b>Lesson:</b> a report is code too; test it with the ugly values, not only the neat ones.</p></div>
<div class="iv"><p class="q">"How would you produce an inventory report from several routers using Python?"</p><p>I log in to each router, run show version, and extract hostname, version, uptime and serial with regular expressions or a parser. I append one row per router to a list, with a header first, and write it to a CSV file with the csv module so that commas and quotes are handled. Then I check the row count and that no value is empty before sharing it.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A CSV file is text: a header line, then one record per line.</li>
<li><code>"w"</code> replaces the file, <code>"a"</code> appends, and <code>with</code> closes it safely.</li>
<li>Joined strings are fine for simple values; the <code>csv</code> module handles commas and quotes.</li>
<li>Lab 2 adds the serial pattern <code>Processor board ID (\\S+)</code> and writes <code>inventory.csv</code>.</li>
<li>Check header, row count and empty values before you share a report.</li>
</ul></div>
`,hi:`
<p>Parsing collection script ka sirf aadha hissa hai. Doosra aadha hai result ko <b>pahunchana</b>: aisi file jo manager, auditor ya spreadsheet use kar sake. Sabse common format <b>CSV</b> (comma-separated values) hai: plain text, har line mein ek row, fields commas se alag. Excel aur Google Sheets ise seedha kholte hain. Yeh chapter lab 2 poora karta hai, jahan <code>inv.py</code> <code>inventory.csv</code> likhta hai.</p>
<h3>CSV file kaisi dikhti hai</h3>
<p>CSV bas text hai. Pehli line <b>header</b> hai jisme column names hote hain. Baaki har line ek record hai, jisme fields ki ginti wahi rehti hai.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Parsing se report tak"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Raw text</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">show version</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Values</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">host, version, uptime, serial</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">Rows</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">har router ki ek string</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">File</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">inventory.csv</text></svg><p class="cap">Parsing se report tak</p></div>
<h3>Method 1: lines khud banao</h3>
<p>Chhote kaam ke liye har line f-string se banao aur lines ko new-line character se jodo. Lab yahi karta hai. Example teen fixed rows use karta hai taaki kahin bhi chal sake.</p>
<pre class="code">rows = ["hostname,version,uptime,serial"]
rows.append("BLR-CORE,2.0,0 minutes,NK3C15U4X00")
rows.append("BLR-WAN,2.0,0 minutes,NK45ZYX1X00")

with open("inventory.csv", "w") as f:
    f.write("\\n".join(rows) + "\\n")

with open("inventory.csv") as f:
    text = f.read()
print(text)
print("Lines in file:", len(text.splitlines()))</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">hostname,version,uptime,serial
BLR-CORE,2.0,0 minutes,NK3C15U4X00
BLR-WAN,2.0,0 minutes,NK45ZYX1X00

Lines in file: 3</pre>
<p>Teen baatein zaroori hain. <code>"w"</code> file ko <b>likhne</b> ke liye kholta hai aur usi naam ki purani file ko <b>badal deta</b> hai. <code>"\\n".join(rows)</code> rows ke <b>beech</b> mein new line daalta hai, isliye aakhri line poori karne ke liye ek aur <code>"\\n"</code> jodte ho. <code>with</code> block file ko aapke liye band kar deta hai, jisse pakka hota hai ki data sach mein save hua.</p>
<h3>Comma ki problem</h3>
<p>Method 1 ki ek kamzori hai: jis value mein <b>comma</b> ho woh do columns mein toot jaati hai. <code>Andheri, Mumbai</code> jaisi location uske baad ke har column ko khisaka degi. Standard <code>csv</code> module aisi value ke aaspaas quotes laga kar yeh solve karta hai.</p>
<pre class="code">import csv
import io

buffer = io.StringIO()
writer = csv.writer(buffer, lineterminator="\\n")
writer.writerow(["hostname", "location"])
writer.writerow(["MUM-R1", "Andheri, Mumbai"])
writer.writerow(["BLR-CORE", "Bengaluru"])
print(buffer.getvalue())

rows = list(csv.reader(io.StringIO(buffer.getvalue())))
print(rows[1])
print(len(rows[1]), "fields")</pre><p><i>Reference code (simulator mein nahi chalta). Neeche ka output standard Python 3 ka hai.</i></p><pre class="out">hostname,location
MUM-R1,"Andheri, Mumbai"
BLR-CORE,Bengaluru

['MUM-R1', 'Andheri, Mumbai']
2 fields</pre>
<p>Doosri row <code>Andheri, Mumbai</code> ke aaspaas quotes ke saath likhi gayi hai, aur wapas padhne par <b>do</b> fields milte hain, teen nahi. Jab data logon se ya free text se aaye to <code>csv</code> module use karo. Serial numbers aur versions ke liye Method 1 kaafi hai. Dictionaries ke saath wahi kaam <code>csv.DictWriter</code> karta hai: woh dictionaries ki list likhta hai aur keys se columns chunta hai.</p>
<h3>Lab 2 poora karna</h3>
<p>Lab 2 mein <code>inv.py</code> mein hostname, version aur uptime ke patterns pehle se hain. Do kaam baaki hain: serial number aur file. <code>Version</code> ki spelling fix karne ke baad yeh poori script aur lab mein uska asli output hai:</p>
<pre class="code">import re
from nkmiko import ConnectHandler

ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]
rows = ["hostname,version,uptime,serial"]

for ip in ROUTERS:
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    out = conn.send_command("show version")
    conn.disconnect()
    host = re.search(r"(\\S+) uptime is", out).group(1)
    version = re.search(r"Version (\\S+),", out).group(1)
    uptime = re.search(r"uptime is (.+)", out).group(1)
    serial = re.search(r"Processor board ID (\\S+)", out).group(1)
    rows.append(f"{host},{version},{uptime},{serial}")

with open("inventory.csv", "w") as f:
    f.write("\\n".join(rows) + "\\n")

print("Wrote", len(rows) - 1, "routers to inventory.csv")
print(open("inventory.csv").read())</pre><p><i>Lab terminal mein chalaya (lab routers use hote hain). Output simulator se liya gaya.</i></p><pre class="out">Wrote 3 routers to inventory.csv
hostname,version,uptime,serial
BLR-CORE,2.0,0 minutes,NK3C15U4X00
BLR-WAN,2.0,0 minutes,NK45ZYX1X00
BLR-LAB,2.0,0 minutes,NK3W0D82X00</pre>
<p>BLR-WAN ka serial number, jo lab ka jawab hai, <code>NK45ZYX1X00</code> hai. File ko kisi bhi report ki tarah check karo: header hai, har router ki ek row, aur kisi row mein <code>TODO</code> na bacha ho.</p>
<h3>Report ke doosre shape</h3>
<p>CSV flat hai: har device ki ek row. Jab record ke andar lists hon, jaise ek switch ke kai VLANs, to pichhle module ka JSON behtar file hai. Dono mein idea wahi hai: <b>collect, parse, result store karo, phir store kiye data se report banao</b>. Ek chhoti script jo <code>inventory.csv</code> ko wapas padhe, "kaun se routers purane version par hain?" jaise sawaal ka jawab kisi device mein login kiye bina de sakti hai.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Rows jodne the par file <code>"w"</code> se kholi; <code>"w"</code> purana content mita deta hai, <code>"a"</code> jodta hai. (2) Aakhri new line bhoolna, jisse agla tool do records chipka deta hai. (3) Column mein placeholder <code>TODO</code> chhod kar report bhej dena. (4) Comma wali values ko Method 1 ki lines mein daalna. (5) Yeh check kiye bina report likhna ki har pattern match hua.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>json.dump</code> file object mein likhta hai; <code>json.dumps</code> string return karta hai. CSV ke liye quoting <code>csv</code> module sambhalta hai; commas se jodna nahi. File ko <code>"w"</code> se kholna use khaali kar deta hai.</p></div>
<div class="scn"><h4>Khisaka hua column wali inventory</h4><p>Ek team ne joined strings se switch inventory export ki. Ek location field mein <code>Floor 3, Annexe</code> tha. Excel mein uske neeche ki har row ek column daayen khisak gayi, aur serial numbers uptime ke heading ke neeche dikhne lage. Ek hafte tak kisi ne dhyaan nahi diya, jab tak audit ne serials ko purchase records se nahi milaya. <code>csv</code> module par jaane se quotes lag gaye aur audit pass hua.</p>
<p><b>Lesson:</b> report bhi code hai; use sirf saaf values par nahi, gande values par bhi test karo.</p></div>
<div class="iv"><p class="q">"Python se kai routers ki inventory report kaise banaoge?"</p><p>Main har router mein login karke show version chalata hoon, aur regular expressions ya parser se hostname, version, uptime aur serial nikalta hoon. Pehle header ke saath, har router ki ek row list mein jodta hoon aur csv module se CSV file mein likhta hoon taaki commas aur quotes sambhal jaayen. Phir share karne se pehle row count aur koi value khaali na ho, yeh check karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CSV file text hai: ek header line, phir har line ek record.</li>
<li><code>"w"</code> file badalta hai, <code>"a"</code> jodta hai, aur <code>with</code> use surakshit band karta hai.</li>
<li>Simple values ke liye joined strings theek; commas aur quotes <code>csv</code> module sambhalta hai.</li>
<li>Lab 2 serial pattern <code>Processor board ID (\\S+)</code> jodta hai aur <code>inventory.csv</code> likhta hai.</li>
<li>Report share karne se pehle header, row count aur khaali values check karo.</li>
</ul></div>
`}};export{e as default};
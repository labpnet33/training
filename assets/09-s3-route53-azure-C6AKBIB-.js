var e={id:`s3-route53-azure`,h:{en:`S3 for config backups, Route 53 for names, and a note on Azure`,hi:`Config backups ke liye S3, naamon ke liye Route 53, aur Azure par ek note`},body:{en:`
<p>A network does not live on VPCs alone. Two other services turn up in almost every network automation job: <b>S3</b>, where you keep backups and reports, and <b>Route 53</b>, where the names that point at your networks live. This chapter shows the minimum a network engineer needs from each, with one script that runs in the lab. The last section is about Azure and is theory only.</p>

<h3>An analogy: a filing cabinet and a phone book</h3>
<p>S3 is a filing cabinet with unlimited drawers. A drawer is a <b>bucket</b>; a file is an <b>object</b> with a <b>key</b> (a path-like name). Route 53 is the phone book: it turns the name <code>web.nk-lab.example</code> into the address <code>203.0.113.10</code>. Both are global in how you name them, but buckets live in a region.</p>

<h3>One script: back up a config, keep versions, publish a name</h3>
<pre class="code"><span class="c"># s3r53.py - back a config file up to S3 and publish a DNS name in Route 53</span>
import boto3
from botocore.exceptions import ClientError

s3 = boto3.client("s3")
bucket = "nk-boto-backups-2026"
try:
    s3.create_bucket(Bucket=bucket)
except ClientError as err:
    print("create_bucket without location:", err.response["Error"]["Code"])
s3.create_bucket(Bucket=bucket, CreateBucketConfiguration={"LocationConstraint": "ap-south-1"})
s3.put_bucket_versioning(Bucket=bucket, VersioningConfiguration={"Status": "Enabled"})
open("r1-running.cfg", "w").write("hostname R1\\ninterface Gi0/1\\n description TO-BLR\\n")
s3.upload_file("r1-running.cfg", bucket, "backups/2026-10-11/r1-running.cfg")
open("r1-running.cfg", "w").write("hostname R1\\ninterface Gi0/1\\n description TO-HYD\\n")
s3.upload_file("r1-running.cfg", bucket, "backups/2026-10-11/r1-running.cfg")
for obj in s3.list_objects_v2(Bucket=bucket, Prefix="backups/")["Contents"]:
    print("object:", obj["Key"], obj["Size"], "bytes")
versions = s3.list_object_versions(Bucket=bucket, Prefix="backups/")["Versions"]
print("versions kept:", len(versions), "| latest flags:", [v["IsLatest"] for v in versions])
body = s3.get_object(Bucket=bucket, Key="backups/2026-10-11/r1-running.cfg")["Body"].read().decode()
print(body.splitlines()[2].strip())
try:
    s3.get_object(Bucket=bucket, Key="backups/missing.cfg")
except ClientError as err:
    print("missing key:", err.response["Error"]["Code"])
try:
    s3.delete_bucket(Bucket=bucket)
except ClientError as err:
    print("delete non-empty:", err.response["Error"]["Code"])

r53 = boto3.client("route53")
zone = r53.create_hosted_zone(Name="nk-lab.example", CallerReference="adv-boto3-1")["HostedZone"]["Id"]
change = {"Changes": [{"Action": "UPSERT", "ResourceRecordSet": {"Name": "web.nk-lab.example", "Type": "A", "TTL": 60,
                                                                     "ResourceRecords": [{"Value": "203.0.113.10"}]}}]}
status = r53.change_resource_record_sets(HostedZoneId=zone, ChangeBatch=change)["ChangeInfo"]["Status"]
print("change status:", status)
for rr in r53.list_resource_record_sets(HostedZoneId=zone)["ResourceRecordSets"]:
    print("record:", rr["Name"], rr["Type"], [v["Value"] for v in rr.get("ResourceRecords", [])])
change["Changes"][0]["Action"] = "DELETE"
r53.change_resource_record_sets(HostedZoneId=zone, ChangeBatch=change)
for rr in r53.list_resource_record_sets(HostedZoneId=zone)["ResourceRecordSets"]:
    if rr["Type"] not in ("NS", "SOA"):
        print("unexpected", rr["Name"])
r53.delete_hosted_zone(Id=zone)
for v in s3.list_object_versions(Bucket=bucket)["Versions"]:
    s3.delete_object(Bucket=bucket, Key=v["Key"], VersionId=v["VersionId"])
s3.delete_bucket(Bucket=bucket)
print("buckets left:", len(s3.list_buckets()["Buckets"]), "| zones left:", len(r53.list_hosted_zones()["HostedZones"]))</pre>
<pre class="out">AUTO01$ python3 s3r53.py
create_bucket without location: <span class="hl">IllegalLocationConstraintException</span>
object: backups/2026-10-11/r1-running.cfg 48 bytes
versions kept: <span class="hl">2</span> | latest flags: [False, True]
description TO-HYD
missing key: <span class="hl">NoSuchKey</span>
delete non-empty: <span class="hl">BucketNotEmpty</span>
change status: <span class="hl">PENDING</span>
record: nk-lab.example. NS ['ns-543.awsdns-10.org.', 'ns-955.awsdns-21.co.uk.', 'ns-1360.awsdns-32.com.', 'ns-1744.awsdns-43.net.']
record: nk-lab.example. SOA ['ns-543.awsdns-10.org. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400']
record: web.nk-lab.example. A ['203.0.113.10']
buckets left: 0 | zones left: 0</pre>

<h3>What the output teaches</h3>
<ul>
<li><b>Region rule</b>: outside us-east-1, <code>create_bucket</code> needs <code>CreateBucketConfiguration</code> with a <code>LocationConstraint</code>. Without it you get <code>IllegalLocationConstraintException</code>. The script shows the failure, then the working call.</li>
<li><b>Versioning</b>: with versioning enabled, uploading the same key twice keeps both. The latest flag is true for one version only. A backup bucket should have versioning, so a bad config upload never destroys the good one.</li>
<li><b>Key layout</b>: a date in the key (<code>backups/2026-10-11/...</code>) plus a <code>Prefix</code> filter on <code>list_objects_v2</code> gives you a cheap per-day listing.</li>
<li><b>Errors</b>: a missing key is <code>NoSuchKey</code>; deleting a bucket that still has objects is <code>BucketNotEmpty</code>. With versioning you must delete every <b>version</b>, not only the keys, before the bucket can go.</li>
<li><b>Route 53 change</b>: <code>UPSERT</code> creates or updates a record, and the first status is <code>PENDING</code>. In real AWS it becomes <code>INSYNC</code> when all name servers have it; a waiter, <code>resource_record_sets_changed</code>, polls for that. A new zone arrives with NS and SOA records; those stay, and your own records must be deleted before the zone can be (<code>HostedZoneNotEmpty</code> otherwise).</li>
<li><b>Clean-up again</b>: the last two lines return the account to zero buckets and zero zones. The same discipline as chapter 8 applies to every service.</li>
</ul>

<h3>Azure: theory only</h3>
<div class="note"><p><b>The lab has no Azure engine.</b> Nothing in this section was run, and no Azure code is shown, because we only print what the lab terminal printed. The Config modules <code>azure-start</code>, <code>azure-vnet</code> and <code>azure-nsg</code> teach the Azure objects in depth.</p></div>
<p>The ideas you built carry over. The names change.</p>
<table class="cmp"><tr><th>AWS (this module)</th><th>Azure</th></tr>
<tr><td>VPC</td><td>Virtual network (VNet)</td></tr>
<tr><td>Subnet (one AZ)</td><td>Subnet (spans the region by default)</td></tr>
<tr><td>Internet gateway + default route</td><td>No gateway object: public IPs and a system default route to the internet</td></tr>
<tr><td>Route table</td><td>Route table with user-defined routes</td></tr>
<tr><td>Security group (stateful, on the instance)</td><td>Network security group (stateful, on a subnet or a network interface)</td></tr>
<tr><td>Elastic IP</td><td>Public IP address</td></tr>
<tr><td>boto3, credential chain</td><td>Azure SDK for Python: <code>azure-identity</code> with <code>DefaultAzureCredential</code>, and <code>azure-mgmt-network</code></td></tr>
<tr><td>Waiters</td><td>Long-running operation pollers (<code>begin_...</code> methods and <code>.result()</code>)</td></tr>
<tr><td>Tag + audit + undo stack</td><td>Resource group: delete the group and everything in it goes</td></tr></table>
<p>The last row is the big difference for clean-up. Azure puts resources into a <b>resource group</b>, so the tear-down of a whole lab is often one delete of the group. The habit stays the same: put every build in its own group, tag it, and prove afterwards that the group is gone.</p>

<div class="warn"><p><b>Common mistake.</b> Treating a bucket name like a variable you can reuse. Bucket names are global across all accounts, and a deleted name can be taken by someone else. Never print or store real secrets in a bucket without encryption and a policy; the lab examples contain only fictional configs.</p></div>

<div class="exam"><p><b>Exam trap.</b> Route 53 hosted zones are global; S3 buckets are created in a region. A zone is not deleted while it holds records other than NS and SOA.</p></div>

<div class="scn"><h4>The config that overwrote itself</h4><p>A nightly job saved each router's running config to S3 under a fixed key, <code>r1-running.cfg</code>. One night a bad template produced an empty file and the job uploaded it. With no versioning, yesterday's good config was gone. After the incident the bucket got versioning and keys carried a date.</p><p><b>Lesson:</b> a backup that can be overwritten is not a backup.</p></div>

<div class="iv"><p class="q">"Where does S3 fit in network automation?"</p><p>It is the durable place for config backups, change reports, rendered templates and audit output. I enable versioning, put the date in the key, upload with upload_file, and list with a prefix. For names I use Route 53 with UPSERT through change_resource_record_sets, and I wait for the change to be in sync before relying on it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>S3 holds objects under keys in regional buckets; versioning keeps every upload.</li>
<li>Outside us-east-1, <code>create_bucket</code> needs a <code>LocationConstraint</code>.</li>
<li>A bucket with versions must have every version deleted before it can be removed.</li>
<li>Route 53 changes start <code>PENDING</code>; zones keep NS and SOA records.</li>
<li>Azure is theory here: the lab has no Azure engine; the clean-up habit moves to resource groups.</li>
</ul></div>
`,hi:`
<p>Network sirf VPCs par nahi rehta. Do aur services lagbhag har network automation job mein aati hain: <b>S3</b>, jahan backups aur reports rakhte hain, aur <b>Route 53</b>, jahan woh naam rehte hain jo aapke networks ko point karte hain. Yeh chapter har ek se network engineer ko jo minimum chahiye woh dikhata hai, ek script ke saath jo lab mein chalti hai. Aakhri section Azure ke baare mein hai aur sirf theory hai.</p>

<h3>Analogy: filing cabinet aur phone book</h3>
<p>S3 ek filing cabinet hai jisme unlimited drawers hain. Drawer ek <b>bucket</b> hai; file ek <b>object</b> hai jiska ek <b>key</b> (path jaisa naam) hota hai. Route 53 phone book hai: woh naam <code>web.nk-lab.example</code> ko address <code>203.0.113.10</code> mein badalta hai. Naam rakhne mein dono global hain, par buckets ek region mein rehte hain.</p>

<h3>Ek script: config backup karo, versions rakho, naam publish karo</h3>
<pre class="code"><span class="c"># s3r53.py - back a config file up to S3 and publish a DNS name in Route 53</span>
import boto3
from botocore.exceptions import ClientError

s3 = boto3.client("s3")
bucket = "nk-boto-backups-2026"
try:
    s3.create_bucket(Bucket=bucket)
except ClientError as err:
    print("create_bucket without location:", err.response["Error"]["Code"])
s3.create_bucket(Bucket=bucket, CreateBucketConfiguration={"LocationConstraint": "ap-south-1"})
s3.put_bucket_versioning(Bucket=bucket, VersioningConfiguration={"Status": "Enabled"})
open("r1-running.cfg", "w").write("hostname R1\\ninterface Gi0/1\\n description TO-BLR\\n")
s3.upload_file("r1-running.cfg", bucket, "backups/2026-10-11/r1-running.cfg")
open("r1-running.cfg", "w").write("hostname R1\\ninterface Gi0/1\\n description TO-HYD\\n")
s3.upload_file("r1-running.cfg", bucket, "backups/2026-10-11/r1-running.cfg")
for obj in s3.list_objects_v2(Bucket=bucket, Prefix="backups/")["Contents"]:
    print("object:", obj["Key"], obj["Size"], "bytes")
versions = s3.list_object_versions(Bucket=bucket, Prefix="backups/")["Versions"]
print("versions kept:", len(versions), "| latest flags:", [v["IsLatest"] for v in versions])
body = s3.get_object(Bucket=bucket, Key="backups/2026-10-11/r1-running.cfg")["Body"].read().decode()
print(body.splitlines()[2].strip())
try:
    s3.get_object(Bucket=bucket, Key="backups/missing.cfg")
except ClientError as err:
    print("missing key:", err.response["Error"]["Code"])
try:
    s3.delete_bucket(Bucket=bucket)
except ClientError as err:
    print("delete non-empty:", err.response["Error"]["Code"])

r53 = boto3.client("route53")
zone = r53.create_hosted_zone(Name="nk-lab.example", CallerReference="adv-boto3-1")["HostedZone"]["Id"]
change = {"Changes": [{"Action": "UPSERT", "ResourceRecordSet": {"Name": "web.nk-lab.example", "Type": "A", "TTL": 60,
                                                                     "ResourceRecords": [{"Value": "203.0.113.10"}]}}]}
status = r53.change_resource_record_sets(HostedZoneId=zone, ChangeBatch=change)["ChangeInfo"]["Status"]
print("change status:", status)
for rr in r53.list_resource_record_sets(HostedZoneId=zone)["ResourceRecordSets"]:
    print("record:", rr["Name"], rr["Type"], [v["Value"] for v in rr.get("ResourceRecords", [])])
change["Changes"][0]["Action"] = "DELETE"
r53.change_resource_record_sets(HostedZoneId=zone, ChangeBatch=change)
for rr in r53.list_resource_record_sets(HostedZoneId=zone)["ResourceRecordSets"]:
    if rr["Type"] not in ("NS", "SOA"):
        print("unexpected", rr["Name"])
r53.delete_hosted_zone(Id=zone)
for v in s3.list_object_versions(Bucket=bucket)["Versions"]:
    s3.delete_object(Bucket=bucket, Key=v["Key"], VersionId=v["VersionId"])
s3.delete_bucket(Bucket=bucket)
print("buckets left:", len(s3.list_buckets()["Buckets"]), "| zones left:", len(r53.list_hosted_zones()["HostedZones"]))</pre>
<pre class="out">AUTO01$ python3 s3r53.py
create_bucket without location: <span class="hl">IllegalLocationConstraintException</span>
object: backups/2026-10-11/r1-running.cfg 48 bytes
versions kept: <span class="hl">2</span> | latest flags: [False, True]
description TO-HYD
missing key: <span class="hl">NoSuchKey</span>
delete non-empty: <span class="hl">BucketNotEmpty</span>
change status: <span class="hl">PENDING</span>
record: nk-lab.example. NS ['ns-543.awsdns-10.org.', 'ns-955.awsdns-21.co.uk.', 'ns-1360.awsdns-32.com.', 'ns-1744.awsdns-43.net.']
record: nk-lab.example. SOA ['ns-543.awsdns-10.org. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400']
record: web.nk-lab.example. A ['203.0.113.10']
buckets left: 0 | zones left: 0</pre>

<h3>Output kya sikhata hai</h3>
<ul>
<li><b>Region rule</b>: us-east-1 ke bahar <code>create_bucket</code> ko <code>LocationConstraint</code> ke saath <code>CreateBucketConfiguration</code> chahiye. Iske bina <code>IllegalLocationConstraintException</code> milta hai. Script pehle failure dikhati hai, phir chalne wali call.</li>
<li><b>Versioning</b>: versioning on ho to wahi key do baar upload karne par dono rehti hain. Latest flag sirf ek version ke liye true hai. Backup bucket mein versioning honi chahiye, taaki kharab config upload achhi config ko kabhi na mitaye.</li>
<li><b>Key layout</b>: key mein date (<code>backups/2026-10-11/...</code>) aur <code>list_objects_v2</code> par <code>Prefix</code> filter se sasti per-day listing milti hai.</li>
<li><b>Errors</b>: missing key <code>NoSuchKey</code> hai; jis bucket mein abhi objects hain use delete karna <code>BucketNotEmpty</code>. Versioning ke saath bucket hatane se pehle har <b>version</b> delete karna padta hai, sirf keys nahi.</li>
<li><b>Route 53 change</b>: <code>UPSERT</code> record banata ya update karta hai, aur pehla status <code>PENDING</code> hota hai. Asli AWS mein sab name servers ke paas aa jaane par woh <code>INSYNC</code> ho jata hai; waiter <code>resource_record_sets_changed</code> use poll karta hai. Nayi zone NS aur SOA records ke saath aati hai; woh rehte hain, aur zone delete karne se pehle aapke apne records delete karne padte hain (warna <code>HostedZoneNotEmpty</code>).</li>
<li><b>Clean-up phir se</b>: aakhri do lines account ko zero buckets aur zero zones par wapas laati hain. Chapter 8 ka wahi discipline har service par lagta hai.</li>
</ul>

<h3>Azure: sirf theory</h3>
<div class="note"><p><b>Lab mein Azure engine nahi hai.</b> Is section mein kuch bhi run nahi hua, aur koi Azure code nahi dikhaya gaya, kyunki hum sirf wahi print karte hain jo lab terminal ne print kiya. Config modules <code>azure-start</code>, <code>azure-vnet</code> aur <code>azure-nsg</code> Azure objects gehrai se sikhate hain.</p></div>
<p>Jo ideas aapne banaye woh saath chalte hain. Naam badalte hain.</p>
<table class="cmp"><tr><th>AWS (yeh module)</th><th>Azure</th></tr>
<tr><td>VPC</td><td>Virtual network (VNet)</td></tr>
<tr><td>Subnet (ek AZ)</td><td>Subnet (default mein poore region mein)</td></tr>
<tr><td>Internet gateway + default route</td><td>Koi gateway object nahi: public IPs aur internet ka system default route</td></tr>
<tr><td>Route table</td><td>User-defined routes wali route table</td></tr>
<tr><td>Security group (stateful, instance par)</td><td>Network security group (stateful, subnet ya network interface par)</td></tr>
<tr><td>Elastic IP</td><td>Public IP address</td></tr>
<tr><td>boto3, credential chain</td><td>Azure SDK for Python: <code>DefaultAzureCredential</code> ke saath <code>azure-identity</code>, aur <code>azure-mgmt-network</code></td></tr>
<tr><td>Waiters</td><td>Long-running operation pollers (<code>begin_...</code> methods aur <code>.result()</code>)</td></tr>
<tr><td>Tag + audit + undo stack</td><td>Resource group: group delete karo aur uske andar sab chala jata hai</td></tr></table>
<p>Aakhri row clean-up ke liye bada farq hai. Azure resources ko <b>resource group</b> mein rakhta hai, isliye poori lab ka tear-down aksar group ka ek delete hota hai. Aadat wahi rehti hai: har build ko apna group do, tag karo, aur baad mein saabit karo ki group chala gaya.</p>

<div class="warn"><p><b>Common mistake.</b> Bucket ke naam ko aise variable ki tarah dekhna jo dobara use ho sake. Bucket names saare accounts mein global hain, aur delete hua naam koi aur le sakta hai. Asli secrets ko encryption aur policy ke bina bucket mein kabhi store ya print mat karo; lab ke examples mein sirf kalpanik configs hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Route 53 hosted zones global hain; S3 buckets ek region mein bante hain. Jab tak zone mein NS aur SOA ke alawa records hain woh delete nahi hoti.</p></div>

<div class="scn"><h4>Woh config jisne khud ko overwrite kar diya</h4><p>Ek nightly job har router ki running config ko S3 mein ek fixed key, <code>r1-running.cfg</code>, ke neeche save karti thi. Ek raat kharab template ne khali file banayi aur job ne use upload kar diya. Versioning ke bina kal ki achhi config chali gayi. Incident ke baad bucket mein versioning lagi aur keys mein date aayi.</p><p><b>Lesson:</b> jo backup overwrite ho sakta hai woh backup nahi hai.</p></div>

<div class="iv"><p class="q">"Network automation mein S3 kahan fit hota hai?"</p><p>Yeh config backups, change reports, rendered templates aur audit output ke liye durable jagah hai. Main versioning enable karta hoon, key mein date rakhta hoon, upload_file se upload karta hoon aur prefix se list karta hoon. Naamon ke liye Route 53 use karta hoon, change_resource_record_sets ke through UPSERT se, aur kisi par bharosa karne se pehle change ke in sync hone ka intezaar karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>S3 regional buckets mein keys ke neeche objects rakhta hai; versioning har upload rakhti hai.</li>
<li>us-east-1 ke bahar <code>create_bucket</code> ko <code>LocationConstraint</code> chahiye.</li>
<li>Versions wale bucket ko hatane se pehle har version delete karna padta hai.</li>
<li>Route 53 changes <code>PENDING</code> se shuru hote hain; zones NS aur SOA records rakhti hain.</li>
<li>Azure yahan theory hai: lab mein Azure engine nahi hai; clean-up ki aadat resource groups par shift hoti hai.</li>
</ul></div>
`}};export{e as default};
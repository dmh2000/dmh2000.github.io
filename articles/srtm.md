Shuttle Radar Topography Mission
--------------------------------

# Part 1 - The Data

The United States military and civilian geographics agencies
maintained a set of digital elevation data of the USA and
various other countries. The defense side called this data
'DTED', for Digital Terrain Elevation data. It consisted of
a set of files, each of which contained elevation data for evenly
spaced points in a 1 degree latitude/longitude square. The data was typically
stored as meters represented with 16 bit integers plus 0xffff
for missing points. This data was available to the public in 
a very coarse resolution, about 90 meters spacing between the points.
The military DTED files were originally stored on tape and the file
format was a bit convoluted.

The data itself had been painstakingly gathered over decades by various
means, including tedious hand surveys of the areas. Then, in 
the year 2000, an international Space Shuttle mission was launched that 
virtually obsoleted all the previously gathered data. The Shuttle
mapped the elevation data of the entire world using radar interferometry.
Since that mission, an international group headed by NASA has 
taken the elevation data and processed it in to a usable form. The
NASA website for this mission is at [NASA SRTM MISSION](https://www2.jpl.nasa.gov/srtm/mission.htm)
The latest version of the processed data is called version 3.0, which 
is the best publicly available SRTM data.

 Initially only files with
 SRTM3 (3 arc-second/90 meter resolution) were publicly available. Later,
 SRTM1 (1 src-second/30 meter resolution) covering the United States was
 released. Since then, various government agencies have made the data available
 in various formats,resolutions and methods of obtaining the data. Since
 the the data is organized by latitude/longitude, the actual resolution
 is in arc-seconds (3600 arc seconds per degree of lat/lon) and the
 resolution in meters varies depending on latitude. 
 
 For coverage of the United States, if you are happy with version SRTM version 2.1, 
 the most convenient way to get the full dataset, and comprehensive documentation is
 from the [USGS SRTM data website](https://dds.cr.usgs.gov/srtm).
 Within that site:
 
  - [Best documentation of the data format](https://dds.cr.usgs.gov/srtm/version2_1/Documentation/SRTM_Topo.pdf)
  - [SRTM 3 data](https://dds.cr.usgs.gov/srtm/version2_1/SRTM3/) - world wide coverage in .hgt format
  - [SRTM 1 data](https://dds.cr.usgs.gov/srtm/version2_1/SRTM1/) - United States coverage in .hgt format
  
  See the data format document above for the detailed explanation of
  the .hgt file format, but basically it is an evenly spaced grid of 1 arc-second
  height 'postings', where each posting is a 16 bit integer representing meters
  in altitude,  with the lower left corner at an even lat/lon position.
  Each 1 degree square of SRTM1 data is about 12MB
  zipped, 25MB unzipped. The files are organized by regions and the
  location of each file is specified in the filename. The .hgt files
  do not contain any other metadata (which makes them convenient to utilize).
  
  If you want the best possible data with worldwide coverage, NASA has
  released [NASA SRTM GL1 V003](https://lpdaac.usgs.gov/products/srtmgl1v003/). The data
  available here is much more comprehensive with several data sets in various formats. The good
  news is that you can get to the data for direct download from the above link and then
  [NASA SRTM GL1 V003->Tools->Data Pool->NASADEM](https://e4ftl01.cr.usgs.gov/provisional/MEaSUREs/NASADEM/). 
    
   # Part 2 - Getting it with Python
   
   # Part 3 - Visualizing 
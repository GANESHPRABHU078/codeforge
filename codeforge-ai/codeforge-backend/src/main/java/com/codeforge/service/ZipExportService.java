package com.codeforge.service;

import com.codeforge.entity.GeneratedFile;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class ZipExportService {

    public byte[] buildZip(List<GeneratedFile> files) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ZipOutputStream zos = new ZipOutputStream(baos)) {

            for (GeneratedFile file : files) {
                String entryPath = (file.getFilePath() == null ? "" : file.getFilePath()) + file.getFileName();
                zos.putNextEntry(new ZipEntry(entryPath));
                zos.write(file.getContent().getBytes());
                zos.closeEntry();
            }

            zos.finish();
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to build project ZIP", e);
        }
    }
}
